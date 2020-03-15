const { 
    Program, LetStatement, ReturnStatement, ExpressionStatement, 
    Identifier, IntegerLiteral, PrefixExpression, InfixExpression, 
    Boolean, IfExpression, BlockStatement, FunctionLiteral, CallExpression,
}  = require('./ast')
const {
    IntegerType, BooleanType, NullType, ReturnValue, ErrorType, Environment, FunctionType,
    newEnclosedEnv, 
    StringType, BuiltinType, ArrayType,
} = require('./object')

const { Token } = require('./token')

const {
    EOF, ASSIGN, SEMICOLON, LPAREN, RPAREN, ILLEGAL, FUNCTION, LET, IDENT,
    INT, SLASH, ASTERISK, LT, GT, COMMA, LBRACE, RBRACE, BANG, NOT_EQ, 
    PLUS, MINUS, EQ, IF, ELSE, TRUE, FALSE, RETURN,
} = require('./token_constants')

const { Parser } = require('./parser')
const { Lexer } = require('./lexer')

const TRUE_INSTANCE = new BooleanType(true) 
const FALSE_INSTANCE = new BooleanType(false) 
const NULL_INSTANCE = new NullType(null)

const getBoolean = (input) => {
    if(input) {
        return TRUE_INSTANCE
    }
    return FALSE_INSTANCE
}

const getBuiltins = (fnName) => {    
    const m = {
        'len': new BuiltinType('len', function(args) {            
            if(args.length !== 1) {
                return new ErrorType(`wrong number of arguments, expected 1, but got ${args.length}`)
            }
            const stringLiteral = args[0]
            const type = stringLiteral.constructor.name
            if(type === 'StringType') {
                return new IntegerType(stringLiteral.value.length)
            }
            return new ErrorType(`argument to 'len' not supported, got ${type}`)
        }),
    }
    return m[fnName]
}

/**
 * js 里有 eval 了，不重名
 */
function monkeyEval(astNode, env) {
    // TODO。这里应该换成常量，还没想好怎么换
    // TODO。null 的构造器是 Identifier，所以多了一层判断
    const type = astNode.constructor.name    
    let left, right, val
    switch(type) {        
        case 'Program':
            return evalProgram(astNode.statements, env)
        case 'ExpressionStatement':
            return monkeyEval(astNode.expression, env)
        case 'IntegerLiteral':
            return new IntegerType(astNode.value)
        case 'StringLiteral':
            return new StringType(astNode.value)
        case 'ArrayLiteral':
            const elements = evalExpressions(astNode.elements, env)
            if(elements.length === 1 && isError(elements[0])) {
                return elements[0]
            }
            return new ArrayType(elements)
        case 'Boolean':
            return getBoolean(astNode.value)
        case 'Identifier':
            if(astNode.value === 'null') {
                return NULL_INSTANCE
            }
            return evalIdentifier(astNode, env)
        case 'PrefixExpression':
            right = astNode.right
            const flatternRight = monkeyEval(right, env)
            if(isError(flatternRight)) {
                return flatternRight
            }
            return evalPrefixExpression(astNode.operator, flatternRight)
        case 'InfixExpression':
            left = monkeyEval(astNode.left, env)
            if(isError(left)) {
                return left
            }
            right = monkeyEval(astNode.right, env)
            if(isError(right)) {
                return right
            }
            return evalInfixExpression(astNode.operator, left, right)
        case 'BlockStatement':
            return evalBlockStatement(astNode.statements, env)
        case 'IfExpression':
            return evalIfExpression(astNode, env)
        case 'ReturnStatement':
            val = monkeyEval(astNode.returnValue, env)
            if(isError(val)) {
                return val
            }
            return new ReturnValue(val)
        case 'LetStatement':            
            val = monkeyEval(astNode.value, env)
            if(isError(val)) {
                return val
            }                        
            return env.set(astNode.name.value, val)
        case 'FunctionLiteral':
            const params = astNode.parameters
            const body = astNode.body
            return new FunctionType(params, body, env)
        case 'CallExpression':
            const fn = monkeyEval(astNode.fnexpression, env)
            if(isError(fn)) {
                return fn
            }
            const args = evalExpressions(astNode.arguments, env)
            if(args.length === 1 && isError(args[0])) {
                return args[0]
            }
            return applyFunction(fn, args)
    }
}

function evalProgram(statements, env) {
    let result
    for(const stmt of statements) {
        result = monkeyEval(stmt, env)
        
        const name = result.constructor.name
        if(name === 'ReturnValue') {            
            return result.value
        } else if(name === 'ErrorType') {
            return result
        }
    }
    return result
}

function evalBlockStatement(statements, env) {
    let result
    for(const stmt of statements) {
        result = monkeyEval(stmt, env)

        if(result !== null) {            
            const name = result.constructor.name
            if(name === 'ReturnValue' || name === 'ErrorType') {
                return result
            }            
        }
    }
    return result
}

function evalStatements(statements) {
    let result
    for(const stmt of statements) {        
        // console.log('stmt ', stmt)
        result = monkeyEval(stmt)
        // console.log('iteration ', result)
        // console.log('result.type ', result.type)
        if(result.type === 'RETURN_VALUE') {    
            // 不能处理嵌套判断的原因在此，这里直接 unwrap 了，导致返回的结果
            // 不再满足这个条件了，就会接着计算后面的 return 语句并返回。
            // 但是貌似这里直接返回 result 而不是 result.value 也行啊，为啥要把方法分开呢
            // 为了方便？留个疑问
            return result
        }
    }
    return result
}

function evalPrefixExpression(operator, right) {
    switch(operator) {
        case '!':
            return evalBangOperatorExpression(right)
        case '-':
            return evalMinusPrefixOperatorExpression(right)
        default:
            return new ErrorType(`unknown operator: ${operator} ${right.type}`)
    }
}

function evalBangOperatorExpression(right) {
    // console.log('evalBangOperatorExpression->right', right)
    // const plainRight = monkeyEval(right, env)
    // console.log('evalBangOperatorExpression->plainRight', plainRight.constructor.name)
    const val = right.value
    switch(val) {
        case true:
            // console.log('case true')
            return FALSE_INSTANCE
        case false:
            // console.log('case false')
            return TRUE_INSTANCE
        case 'null':
            // console.log('case null')
            return TRUE_INSTANCE
        default:
            // console.log('case default')
            return FALSE_INSTANCE
    }    
}

function evalMinusPrefixOperatorExpression(right) {
    if(right.type !== 'INTEGER') {
        return new ErrorType(`unknown operator: -${right.type}`)
    }
    const name = right.constructor.name
    if(name !== 'IntegerType') {
        return null
    }
    return new IntegerType(right.value * -1)
}

function evalInfixExpression(operator, left, right) {
    if(left.type !== right.type) {
        return new ErrorType(`type mismatch ${left.type} ${operator} ${right.type}`)
    } else if(left.type === 'INTEGER' && right.type === 'INTEGER') {
        return evalIntegerInfixExpression(operator, left, right)
    } else if(left.type === 'STRING' && right.type === 'STRING') {
        return evalStringInfixExpression(operator, left, right)
    } else if(operator === '==') {
        const leftVal = left.value
        const rightVal = right.value  
        return new BooleanType(leftVal === rightVal)   
    } else if(operator === '!=') {
        const leftVal = left.value
        const rightVal = right.value  
        return new BooleanType(leftVal !== rightVal)   
    } else {
        return new ErrorType(`unknown operator ${left.type} ${operator} ${right.type}`)
    }    
}

function evalIntegerInfixExpression(operator, left, right) {
    const leftVal = left.value
    const rightVal = right.value    
    switch(operator) {
        case '+':
            return new IntegerType(leftVal + rightVal)
        case '-':
            return new IntegerType(leftVal - rightVal)
        case '*':
            return new IntegerType(leftVal * rightVal)
        case '/':
            return new IntegerType(leftVal / rightVal)
        case '<':
            return new BooleanType(leftVal < rightVal)
        case '>':
            return new BooleanType(leftVal > rightVal)
        case '==':
            return new BooleanType(leftVal === rightVal)   
        case '!=':
            return new BooleanType(leftVal !== rightVal)       
        default:
            return new ErrorType(`unknown operator ${left.type} ${operator} ${right.type}`)        
    }    
}

function evalStringInfixExpression(operator, left, right) {
    if(operator !== '+') {
        return new ErrorType(`unknown operator ${left.type} ${operator} ${right.type}`)        
    }
    const leftVal = left.value
    const rightVal = right.value    
    return new StringType(leftVal + rightVal)
}

function evalIfExpression(astNode, env) {    
    const condition = monkeyEval(astNode.condition, env)
    if(isError(condition)) {
        return condition
    }
    if(isTruthy(condition)) {
        return monkeyEval(astNode.consequence, env)
    } else if(astNode.alternative !== undefined) {
        return monkeyEval(astNode.alternative, env)
    } else {
        return new NullType()
    }
}

function evalIdentifier(node, env) {    
    const nodeValue = node.value
    const builtinFn = getBuiltins(nodeValue)
    if(builtinFn !== undefined) {
        return builtinFn
    }
    const val = env.get(nodeValue)
    if(val === undefined) {
        return new ErrorType(`identifier not found: ${nodeValue}`)
    }
    return val
}

function evalExpressions(args, env) {
    const result = []
    for(const exp of args) {
        const evaluated = monkeyEval(exp, env)
        if(isError(evaluated)) {
            return evaluated
        }
        result.push(evaluated)
    }
    return result
}

function applyFunction(fn, args) {
    const fnType = fn.type()
    if(fnType === 'BUILTIN') {
        return fn.impl.call(this, args)
    } else if(type === 'FUNCTION') {
        const extendedEnv = extendFunctionEnv(fn, args)
        const evaluated = monkeyEval(fn.body, extendedEnv)
        return unwrapReturnValue(evaluated)
    } else {
        return new ErrorType(`not a function: ${fn.type()}`)

    }
}

function extendFunctionEnv(fn, args) {
    const innerEnv = fn.env
    const outerEnv = new newEnclosedEnv(innerEnv)
    const parameters = fn.parameters
    for(let i = 0; i < parameters.length; i++) {
        outerEnv.set(parameters[i], args[i])        
    }   
    return outerEnv 
}

function unwrapReturnValue(returnValue) {
    // 这里要判断一下是不是 ReturnValue 包装的，block statements 的最后一个不一定是 ReturnValue 类型的
    if(returnValue.type === 'RETURN_VALUE') {
        return returnValue.value
    }
    return returnValue
}

function isTruthy(condition) {    
    switch(condition.value) {
        case null:
            return false
        case true:
            return true
        case false:            
            return false
        default:            
            return true
    }
}

function isError(val) {
    if(val !== null) {
        return val.type === 'ERROR'
    }
    return false
}

function main() {
    // const intToken = new Token(INT, 123)
    // const intNode = new IntegerLiteral(intToken, 123)    
    // const result = monkeyEval(intNode)
    // console.log('result ', result)

    const text = `
        [1, 2 * 2, 3 + 1]
        `
    const lexer = new Lexer(text, 0, 1, text[0])
    const parser = new Parser(lexer, [])
    const program = parser.parseProgram()
    const env = new Environment()
    // console.log('env', env)
    // const stmts = program.statements    
    // const r =  evalStatements(stmts)
    const r = monkeyEval(program, env)
    console.log('result ', r.type, r.constructor.name, r)    
    for(const item of r.elements) {
        console.log('item ', item)
    }
    console.log('env', env)
}

// main()

module.exports = {
    monkeyEval,
    // evalStatements,
    Environment,
}