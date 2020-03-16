// js 里没法像 Go 那样约束类型，所以这里有点无力
/**
 * 就是 ast 里的每一个节点都是 Node 类型的啦
 * 每个 Node 里都应该有个 tokenLiteral 方法，但是 js 里不知道怎么约束
 */
class Node{
    
}

/**
 * ast 的根节点
 * statements 是数组
 */
class Program{
    constructor(statements) {
        this.statements = statements
    }
    tokenLiteral() {
        if(this.statements.length > 0) {
            return this.statements[0].tokenLiteral()
        } else {
            return ''
        }        
    }
    appendStatement(stmt) {
        this.statements.push(stmt)
    }
    toString() {
        return JSON.stringify(this)
    }
}

/**
 * 语句，不产生值的
 */
class Statement extends Node {
    statementNode() {

    }
}

/**
 * 表达式，产生值
 */
class Expression extends Node {
    // expressionNode() {

    // }
    // toString() {

    // }
}

/**
 * ExpressionStatement，特殊对待。比如 x + 10; 这样的
 */
class ExpressionStatement extends Node {
    constructor(token, expression) {
        super()
        this.token = token
        this.expression = expression
    }
    expressionNode() {

    }
    statementNode() {

    }
    tokenLiteral() {
        return this.token.literal
    }
    toString() {        
        return this.expression.toString()
    }
}

/**
 * let 语句，赋值语句
 * token 是 Token 类型
 * name 是 Identifier 类型
 * value 是 Expression 类型
 */
class LetStatement {
    constructor(token, name, value) {
        this.token = token
        this.name = name
        this.value = value
    }
    statementNode() {

    }
    tokenLiteral() {
        return this.token.literal
    }
    toString() {
        if(this.value !== undefined) {
            const t = `${this.token.literal} ${this.name.toString()} = ${this.value.toString()};`
            return t
        } else {
            return `${this.token.literal} ${this.name.toString()} = 未知;`             
        }        
    }
}

/**
 * return 语句
 * token 是 Token 类型
 * returnValue 是 Expression 类型
 */
class ReturnStatement {
    constructor(token, returnValue) {
        this.token = token
        this.returnValue = returnValue
    }
    statementNode() {

    }
    tokenLiteral() {
        return this.token.literal
    }    
    toString() {        
        const t = `${this.token.literal} ${this.returnValue.toString()};`
        return t
    }
}

/**
 * 标识符
 * token 是 Token.IDENT
 * value 是 字符串
 */
class Identifier{
    constructor(token, value) {
        this.token = token
        this.value = value
    }
    expressionNode() {

    }
    tokenLiteral() {
        return this.token.literal
    }
    toString() {
        return this.value
    }
}

/**
 * 整型
 * token 是 Token.INT
 * value 是 整数值
 */
class IntegerLiteral{
    constructor(token, value) {
        this.token = token
        this.value = value
    }
    get type() {
        return this.constructor.name
    }
    expressionNode() {

    }
    tokenLiteral() {
        return this.token.literal
    }
    toString() {
        return this.value
    }
}

/**
 * 字符串型
 * token 是 Token.STRING
 * value 是 字符串，js 里的字符串
 */
class StringLiteral{
    constructor(token, value) {
        this.token = token
        this.value = value
    }
    get type() {
        return this.constructor.name
    }
    expressionNode() {

    }
    tokenLiteral() {
        return this.token.literal
    }
    toString() {
        return this.token.literal
    }
}

/**
 * 布尔型
 * token 是 Token.True 或者 False
 * value 是 js 里面的 true 或者 false
 */
class Boolean{
    constructor(token, value) {
        this.token = token
        this.value = value
    }
    expressionNode() {

    }
    tokenLiteral() {
        return this.token.literal
    }
    toString() {
        return this.value
    }
}

/**
 * 数组型
 * token 是 Token.LBRACKET
 * elements 是 Expression 类型的数组
 */
class ArrayLiteral{
    constructor(token, elements) {
        this.token = token
        this.elements = elements
    }
    expressionNode() {

    }
    tokenLiteral() {
        return this.token.literal
    }
    toString() {
        const elems = this.elements.join(', ')
        return `[${elems}]`
    }
}

/**
 * 字典型
 * token 是 Token.LBRACE
 * pairs 是 js 的字典，key 和 value 都是 Expression 类型
 */
class HashLiteral{
    constructor(token) {
        this.token = token
        this.pairs = {}
    }
    expressionNode() {

    }
    tokenLiteral() {
        return this.token.literal
    }
    toString() {        
        // const pairs = this.pairs
        // let t = `{ `
        // Object.keys(pairs).forEach( item => {
        //     t += `${item.toString()}: ${pairs[item]},`
        // } )
        // return t + ' }'
        return this.pairs
    }
}

/**
 * 索引访问数组
 * token 是 Token.LBRACKET
 * left 是 Expression 类型
 * index 是 Expression 类型
 * eg. [1, 2, 3][2]，myArray[2 + 1]
 */
class IndexExpression{
    constructor(token, left, index) {
        this.token = token
        this.left = left
        this.index = index
    }
    expressionNode() {

    }
    tokenLiteral() {
        return this.token.literal
    }
    toString() {        
        return `(${this.left.toString()}[${this.index.toString()}]])`
    }
}

/**
 * 前缀表达式
 * token 是 Token.XXX，可以作为前缀的
 * operator 是 字符串
 * right 是 Expression
 */
class PrefixExpression{
    constructor(token, operator, right) {
        this.token = token
        this.operator = operator
        this.right = right
    }
    expressionNode() {

    }
    tokenLiteral() {
        return this.token.literal
    }
    toString() {
        return `(${this.operator}${this.right.toString()})`
    }
}

/**
 * 中缀表达式
 * token 是 Token.XXX，可以作为前缀的
 * left 是 Expression
 * operator 是 字符串
 * right 是 Expression
 */
class InfixExpression{
    constructor(token, left, operator, right) {
        this.token = token
        this.left = left
        this.operator = operator
        this.right = right
    }
    expressionNode() {

    }
    tokenLiteral() {
        return this.token.literal
    }
    toString() {
        return `(${this.left} ${this.operator} ${this.right.toString()})`
    }
}

/**
 * 条件表达式
 * token 是 Token.IF
 * condition 是 Expression 类型
 * consequence 是 BlockStatement 类型
 * alternative 是 BlockStatement 类型
 */
class IfExpression{
    constructor(token, condition, consequence, alternative) {
        this.token = token
        this.condition = condition
        this.consequence = consequence
        this.alternative = alternative
    }
    expressionNode() {

    }
    tokenLiteral() {
        return this.token.literal
    }
    toString() {
        let t = `if ${this.condition.toString()} ${this.consequence.toString()} `
        if(this.alternative !== undefined) {
            t += ` ${this.alternative.toString()}`
        }
        return t
    }
}

/**
 * 语句块
 * token 是 Token.LBRACE
 * statements 是 Statement 类型的数组 
 */
class BlockStatement{
    constructor(token) {
        this.token = token
        this.statements = []                
    }
    statementNode() {

    }
    tokenLiteral() {
        return this.token.literal
    }
    toString() {
        if(this.statements.length === 0) {
            return `{}`
        }
        for(const s of this.statements) {
            return s.toString()
        }
    }
}

/**
 * 函数定义
 * token 是 Token.FN
 * parameters 是 Identifier 类型的数组 
 * body 是 BlockStatement
 */
class FunctionLiteral{
    constructor(token, body) {
        this.token = token
        this.parameters = []                
        this.body = body
    }
    statementNode() {

    }
    tokenLiteral() {
        return this.token.literal
    }
    toString() {
        let p = []
        for(const s of this.parameters) {
            p.push(s.toString())
        }
        p.join(' ')
        return `${this.tokenLiteral()}(${p}) ${this.body.toString()}`
    }
}

/**
 * 函数调用
 * token 是 Token.LPAREN
 * fnexpression 是 Identifier 或者 FunctionLiteral
 * arguments 是 Expression 数组
 */
class CallExpression{
    constructor(token, fnexpression) {
        this.token = token
        this.fnexpression = fnexpression                
        this.arguments = []
    }
    statementNode() {

    }
    tokenLiteral() {
        return this.token.literal
    }
    toString() {
        const args = []
        for(const s of this.arguments) {
            args.push(s.toString())
        }                
        return `${this.fnexpression.toString()}(${args.join(`, `)})`
    }
}

module.exports = {
    Program,
    LetStatement,
    ReturnStatement,
    ExpressionStatement,
    Identifier,
    Boolean,
    IntegerLiteral,
    StringLiteral,
    ArrayLiteral,
    HashLiteral,
    IndexExpression,
    PrefixExpression,
    InfixExpression,
    IfExpression,
    BlockStatement,
    FunctionLiteral,
    CallExpression,
}