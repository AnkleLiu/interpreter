// 类型信息常量
const [
    INTEGER_OBJ, BOOLEAN_OBJ,NULL_OBJ, RETURN_VALUE_OBJ, ERROR_OBJ, FUNCTION_OBJ,
    STRING_OBJ,
] = [
        'INTEGER', 'BOOLEAN', 'NULL', 'RETURN_VALUE', 'ERROR', 'FUNCTION',
        'STRING'
    ]

/**
 * Monkey 语言中值的表示
 * type 是字符串
 */
class ObjectType{
    
}

/**
 * Monkey 语言中整型的表示
 * type 是字符串
 * value 是 js 里面的整型
 */
class IntegerType extends ObjectType{
    constructor(value) {
        super()
        this.type = INTEGER_OBJ
        this.value = value
    }    
    // type() {
    //     return INTEGER_OBJ
    // }
    inspect() {
        // 这里要不要返回或者打印什么呢
        return `${this.value}`        
    }
}

/**
 * Monkey 语言中布尔型的表示
 * type 是字符串
 * value 是 js 里面的布尔类型
 */
class BooleanType extends ObjectType{
    constructor(value) {
        super()
        this.type = BOOLEAN_OBJ
        this.value = value
    }
    inspect() {
        // 这里要不要返回或者打印什么呢
        const t = `${this.value}`
        return t
    }
}

/**
 * Monkey 语言中字符串型的表示
 * type 是字符串
 * value 是 js 里面的字符串
 */
class StringType extends ObjectType{
    constructor(value) {
        super()
        this.type = STRING_OBJ
        this.value = value
    }
    inspect() {
        // 这里要不要返回或者打印什么呢
        const t = `${this.value}`
        return t
    }
}

/**
 * Monkey 语言中空类型的表示
 * type 是字符串
 * value 是 js 里面的 null
 */
class NullType extends ObjectType{
    constructor() {
        super()
        this.type = NULL_OBJ
        this.value = null
    }
    inspect() {                
        return 'null'
    }
}

/**
 * Monkey 保存 return 值，方便追踪
 * type 是字符串
 * value 是 任何 ObjectType
 */
class ReturnValue extends ObjectType{
    constructor(value) {
        super()
        this.type = RETURN_VALUE_OBJ
        this.value = value
    }    
    inspect() {                
        return this.value.inspect()
    }
}

/**
 * Monkey 
 * type 是字符串
 * message 是字符串
 */
class ErrorType extends ObjectType{
    constructor(message) {
        super()
        this.type = ERROR_OBJ
        this.message = message
        // console.log("ERROR: " + this.message)
    }
    inspect() {                
        return "ERROR: " + this.message
    }
}

/**
 * Monkey 环境
 * 就是字典，outer 是上级环境 
 */
class Environment extends ObjectType{
    constructor() {
        super()
        this.env = {}
        this.outer = null                
    }
    get(name) {
        const innerVal = this.env[name]
        if(innerVal === undefined) {
            return this.outer.env[name]
        }
        return innerVal
    }
    set(name, value) {
        this.env[name] = value
        return value
    }
    inspect() {                
        return this.env
    }
}

function newEnclosedEnv(outer) {
    const env = new Environment()
    env.outer = outer
    return env
}

/**
 * Monkey Function 类型
 * body 是 BlockStatement
 * env 是 Environment
 */
class FunctionType extends ObjectType{
    constructor(parameters, body, env) {
        super()
        this.parameters = parameters
        this.body = body
        this.env = env
    }
    type() {
        return FUNCTION_OBJ
    }    
    inspect() {
        const firstPart = `fn(`
        let params = []
        for(const p of this.parameters) {
            params.push(p.toString())
        }
        params = params.join(', ')
        const secondPart = ") {\n"
        const t = `${firstPart}${params}${secondPart}${this.body.toString()}\n}`
        return t
    }
}

module.exports = {
    IntegerType,
    BooleanType,
    StringType,
    NullType,
    ReturnValue,
    ErrorType,
    Environment,
    newEnclosedEnv,
    FunctionType,    
}