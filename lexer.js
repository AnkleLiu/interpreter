const { Token } = require('./token')

const {
    EOF, ASSIGN, SEMICOLON, LPAREN, RPAREN, ILLEGAL, FUNCTION, LET, IDENT,
    INT, SLASH, ASTERISK, LT, GT, COMMA, LBRACE, RBRACE, BANG, NOT_EQ, 
    PLUS, MINUS, EQ, IF, ELSE, TRUE, FALSE, RETURN,
    STRING, LBRACKET, RBRACKET, COLON,
} = require('./token_constants')

// const [
//     EOF, ASSIGN, SEMICOLON, LPAREN, RPAREN, ILLEGAL, FUNCTION, LET, IDENT,
//     INT, SLASH, ASTERISK, LT, GT, COMMA, LBRACE, RBRACE, BANG, NOT_EQ, 
//     PLUS, MINUS, EQ, IF, ELSE, TRUE, FALSE, RETURN,
// ] = [
//     'EOF', 'ASSIGN', 'SEMICOLON', 'LPAREN', 'RPAREN', 'ILLEGAL', 'FUNCTION', 'LET', 'IDENT',
//     'INT', 'SLASH', 'ASTERISK', 'LT', 'GT', 'COMMA', 'LBRACE', 'RBRACE', 'BANG', 'NOT_EQ',
//     'PLUS', 'MINUS', 'EQ', 'IF', 'ELSE', 'TRUE', 'FALSE', 'RETURN',
// ]

const KEY_WORDS = {
    'fn': FUNCTION,
    'let': LET,
    'if': IF,
    'else': ELSE,
    'true': TRUE,
    'false': FALSE,
    'return': RETURN,
}

class Lexer{
    constructor(input, position, readPosition, val) {
        // position 当前位置，readPosition 下一个位置，val 当前字符（即 position 指向的字符）
        this.input = input
        this.position = position
        this.readPosition = readPosition
        this.val = val
    }
    getNextToken() {
        const t = new Token()
        this.skipWhitespace()
        
        switch(this.val) {
            case '=':
                if(this.peek() === '=') {
                    let ch = this.val
                    this.read()                    
                    t.setTypeAndLiteral(EQ, `${ch}${this.val}`)
                } else {                    
                    t.setTypeAndLiteral(ASSIGN, this.val)
                }                
                break
            case '+':                
                t.setTypeAndLiteral(PLUS, this.val)
                break
            case '-':                                
                t.setTypeAndLiteral(MINUS, this.val)
                break
            case '*':
                t.setTypeAndLiteral(ASTERISK, this.val)
                break
            case '/':                                
                t.setTypeAndLiteral(SLASH, this.val)
                break
            case '!':
                if(this.peek() === '=') {
                    const ch = this.val
                    this.read()
                    t.setTypeAndLiteral(NOT_EQ, `${ch}${this.val}`)
                } else {
                    t.setTypeAndLiteral(BANG, `${this.val}`)
                }
                break
            case '<':
                t.setTypeAndLiteral(LT, this.val)
                break
            case '>':
                t.setTypeAndLiteral(GT, this.val)
                break                 
            case ';':                
                t.setTypeAndLiteral(SEMICOLON, this.val)
                break
            case '(':                              
                t.setTypeAndLiteral(LPAREN, this.val)
                break
            case ')':                
                t.setTypeAndLiteral(RPAREN, this.val)
                break
            case ',':
                t.setTypeAndLiteral(COMMA, this.val)
                break
            case '{':
                t.setTypeAndLiteral(LBRACE, this.val)
                break
            case '}':
                t.setTypeAndLiteral(RBRACE, this.val)
                break
            case '[':
                t.setTypeAndLiteral(LBRACKET, this.val)
                break
            case ']':
                t.setTypeAndLiteral(RBRACKET, this.val)
                break                
            case '"':
                t.setTypeAndLiteral(STRING, this.readString())
                break
            case ':':
                t.setTypeAndLiteral(COLON, this.val)
                break
            case null:                                
                t.setTypeAndLiteral(EOF, this.val)
                break
            default:
                if(this.isLetter(this.val)) {
                    const literal = this.readIdentifier()                    
                    const type = this.lookupIdent(literal)
                    t.setTypeAndLiteral(type, literal)
                    return t
                } else if(this.isDigit(this.val)) {                    
                    t.setTypeAndLiteral(INT, this.readNumber())
                    return t
                } else {                    
                    t.setTypeAndLiteral(ILLEGAL, 'ILLEGAL')
                }
        }
        this.read()
        return t
        
    }
    read() {
        const length = this.input.length
        if(this.readPosition >= length) {
            this.val = null
        } else {
            this.val = this.input[this.readPosition]            
        }
        this.position = this.readPosition
        this.readPosition += 1
    }
    peek() {
        const length = this.input.length
        if(this.readPosition >= length) {
            return null
        }
        return this.input[this.readPosition]
    }
    isLetter(char) {
        return (char >= 'a' && char <= 'z') || (char >= 'A' && char <= 'Z') || char == '_'
    }
    readIdentifier() {
        const p = this.position
        while(this.isLetter(this.val)) {
            this.read()
        }
        return this.input.slice(p, this.position)
    }
    lookupIdent(char) {
        const keyArray = Object.keys(KEY_WORDS)        
        if(keyArray.includes(char)) {
            return KEY_WORDS[char]
        } 
        return IDENT
    }
    isDigit(val) {
        return val !== null && val >= '0' && val <= '9'
    }
    readNumber() {
        const p = this.position
        while(this.isDigit(this.val)) {            
            this.read()
        }
        return this.input.slice(p, this.position)
    }
    readString() {        
        const startPosition = this.position + 1        
        while(this.val !== null) {            
            this.read()
            if(this.val === '"' || this.val === undefined) {
                break
            }
        }
        return this.input.slice(startPosition, this.position)
    }
    skipWhitespace() {
        while (this.val == ' ' || this.val == '\t' || this.val == '\n' || this.val == '\r') {
            this.read()
        }
    }
}

function main() {
    const text = `
        let five = 5;
        let ten = 10;

        let add = fn(x, y) {
            x + y;
        };
        let result = add(five, ten);

        !-/*5;
        5 < 10 > 5;

        if (5 < 10) {
            return true;
        } else {
            return false;
        }

        10 == 10;
        10 != 9;
        "foobar"; 
        "foo bar";     
        ""
        [1, 2];
        {"foo": "bar"}
        `
    const lexer = new Lexer(text, 0, 1, text[0])
    for(let i = 0; i < 100; i++) {        
        console.log(lexer.getNextToken())
    }
}

// main()

module.exports = {
    Lexer,
}