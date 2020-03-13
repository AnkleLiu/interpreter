const { log, inspect } = require('./util')

class Token{
    constructor(type, literal) {
        this.type = type
        this.literal = literal
    }
    setTypeAndLiteral(type, literal) {
        this.type = type
        this.literal = literal
    }
    toString() {
        return `Token { type: ${this.type}, literal: ${this.literal}}`
    }
}

// function main() {
//     const t = new Token('string', 'let')
//     log(inspect(t))
// }

// main()

module.exports = {
    Token,
}