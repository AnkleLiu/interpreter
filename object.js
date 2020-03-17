// 类型信息常量
const [
    INTEGER_OBJ, BOOLEAN_OBJ,NULL_OBJ, RETURN_VALUE_OBJ, ERROR_OBJ, FUNCTION_OBJ,
    STRING_OBJ, BUILTIN_OBJ, ARRAY_OBJ, HASH_OBJ,
] = [
        'INTEGER', 'BOOLEAN', 'NULL', 'RETURN_VALUE', 'ERROR', 'FUNCTION',
        'STRING', 'BUILTIN', 'ARRAY', 'HASH',
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
    getHashKey() {
        if(this.hashKey === undefined) {
            this.hashKey = new HashKey(this.type, Number(this.value))
        }
        return this.hashKey
    }
    // set type(typeName) {
    //     return this.type = typeName
    // } 
    // get type() {
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
    getHashKey() {
        // const val = this.value === true ? 1 : 0
        // return new HashKey(this.type, val)
        if(this.hashKey === undefined) {
            const val = this.value === true ? 1 : 0
            this.hashKey = new HashKey(this.type, val)                
        }
        return this.hashKey
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
    getHashKey() {
        // 在书中的示例代码里，用了 byte 函数转换成字节，js 里没有那个问题就不转换了
        // return new HashKey(this.type, this.value)
        if(this.hashKey === undefined) {
            // console.log('hashKey is undefined')
            this.hashKey = new HashKey(this.type, this.value)            
        }
        return this.hashKey
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
 * Monkey 内置函数
 * type 是字符串
 */
class BuiltinType extends ObjectType{
    constructor(fnName, impl) {
        super()
        this.fnName = fnName
        this.impl = impl
    }
    type() {
        return BUILTIN_OBJ
    }
    inspect() {                
        return '[Builtin Function]'
    }    
}

/**
 * Monkey 数组类型
 * elements 里的元素都是 ObjectType
 */
class ArrayType extends ObjectType{
    constructor(elements) {
        super()
        this.type = ARRAY_OBJ
        this.elements = elements        
    }
    // type() {
    //     return ARRAY_OBJ
    // }
    inspect() {   
        let elems = []
        for(const item of this.elements) {            
            elems.push(item.inspect())
        }
        elems = elems.join(', ')             
        return `[${elems}]`
    }    
}

/**
 * Monkey 字典类型
 * key 是 HashKey 类型，value 是 HaskPair 类型
 * 按照作者的说法，是为了 Inspect() 方法，同时打印出 key value
 */
class HashType extends ObjectType {
    constructor() {
        super()
        this.type = HASH_OBJ
        this.pairs = new Map()
    }
    type() {
        return this.type
    }
    inspect() {   
        // 这里可能会有问题，pairs[item]，这个 Item 是 HashKey 类型
        const pairs = this.pairs
        let t = `{ `
        for(const [key, value] of pairs) {
            t += `${key.inspect()}: ${value.inspect()}, `
        }        
        return t + ' }'
    }    
}

/**
 * HashKey 类型，作为哈希的 key。用 js 实现可以不这么做，但是为了和书上保持一致就加了这个
 * 分别加在 IntegerType、BooleanType 和 StringType 里，这三种类型可以作为 key
 */ 
class HashKey {
    constructor(type, value) {
        this.type = type
        this.value = value
    }
    inspect() {
        return `[${this.type}*${this.value}]`
    }
}

/**
 * HashPair 类型
 * 作为 HashType 的 值。key 和 value 都是 ObjectType 类型
 */ 
class HashPair {
    constructor(key, value) {
        this.key = key
        this.value = value
    }
    inspect() {
        return `[${this.key.inspect()}*${this.value.inspect()}]`
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
class FunctionType extends ObjectType {
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
    BuiltinType,
    ArrayType,
    HashKey,
    HashPair,
    HashType,
    Environment,
    newEnclosedEnv,
    FunctionType,    
}