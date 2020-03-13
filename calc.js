const c = {
    PLUS: 'PLUS',
    MINUS: 'MINUS',
    INTEGER: 'INTEGER',
    EOF: 'EOF',
}

class Token{
    constructor(type, value) {
        this.type = type
        this.value = value
    }
}

class Interpreter{
    constructor(text) {
        this.pos = 0
        this.text = text
        this.currentToken = null
        this.currentChar = this.text[this.pos]
    }

    // Lexer
    error() {
        throw new Error('Syntax Error')
    }

    advance() {
        this.pos++
        if(this.pos > this.text.length - 1) {
            this.currentChar = undefined
        } else {
            this.currentChar = this.text[this.pos]
        }
    }

    skipWhitespace() {
        while(this.currentChar === ' ' && this.currentChar !== undefined) {            
            this.advance()
        }
    }

    integer() {
        let result = ''
        while(!isNaN(this.currentChar)) {
            result += this.currentChar
            this.advance()
        }
        return Number(result)
    }

    getNextToken() {
        while(this.currentChar !== undefined) {
            if(this.currentChar === ' ') {                
                this.skipWhitespace()
                continue
            }
            if(!isNaN(this.currentChar)) {                                
                return new Token(c.INTEGER, this.integer())
            } else if(this.currentChar === '+') {                  
                this.advance()
                return new Token(c.PLUS, '+')
            } else {                
                this.advance()
                return new Token(c.MINUS, '-')
            }       
        }
        return new Token(c.EOF, null)
    }

    // Parser
    eat(tokenType) {
        if(this.currentToken.type === tokenType) {
            this.currentToken = this.getNextToken()
        } else {
            this.error()
        }
    }

    term() {
        const token = this.currentToken
        this.eat(c.INTEGER)
        return token.value
    }

    expr() {
        const ops = ['+', '-']
        this.currentToken = this.getNextToken()
        
        let result = this.term()
        while(ops.includes(this.currentToken.value)) {            
            const token = this.currentToken
            if(token.value === '+') {
                this.eat(c.PLUS)                
                result += this.term()                
            } else {
                this.eat(c.MINUS)                
                result -= this.term()                
            }
        }
        return result
    }
}

function main() {
    const t = '12 + 2 - 3'
    const interpreter = new Interpreter(t)
    const result = interpreter.expr()
    console.log('result ', result)    
}

main()