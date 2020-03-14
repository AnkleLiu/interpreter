const { 
    Program, LetStatement, ReturnStatement, ExpressionStatement, 
    Identifier, IntegerLiteral, PrefixExpression, InfixExpression, 
    Boolean, IfExpression, BlockStatement, FunctionLiteral, CallExpression,
    StringLiteral,
}  = require('./ast')
const { Lexer } = require('./lexer')
const {
    EOF, ASSIGN, SEMICOLON, LPAREN, RPAREN, ILLEGAL, FUNCTION, LET, IDENT,
    INT, SLASH, ASTERISK, LT, GT, COMMA, LBRACE, RBRACE, BANG, NOT_EQ, 
    PLUS, MINUS, EQ, IF, ELSE, TRUE, FALSE, RETURN,
    STRING,
    _, LOWEST, EQUALS, LESSGREATER, SUM, PRODUCT, PREFIX, CALL,
} = require('./token_constants')

const PRECENDENCE_ARRAY = [_, LOWEST, EQUALS, LESSGREATER, SUM, PRODUCT, PREFIX, CALL,]

const getPrecedence = (operator) => {
    const map = {
        LOWEST: PRECENDENCE_ARRAY.indexOf(LOWEST),
        EQ: PRECENDENCE_ARRAY.indexOf(EQUALS),
        NOT_EQ: PRECENDENCE_ARRAY.indexOf(EQUALS),
        LT: PRECENDENCE_ARRAY.indexOf(LESSGREATER),
        GT: PRECENDENCE_ARRAY.indexOf(LESSGREATER),
        PLUS: PRECENDENCE_ARRAY.indexOf(SUM),
        MINUS: PRECENDENCE_ARRAY.indexOf(SUM),
        SLASH: PRECENDENCE_ARRAY.indexOf(PRODUCT),
        ASTERISK: PRECENDENCE_ARRAY.indexOf(PRODUCT),   
        LPAREN: PRECENDENCE_ARRAY.indexOf(CALL)     
    }
    return map[operator]
}

class Parser {
    constructor(lexer, errors) {
        this.lexer = lexer
        this.errors = errors
        const firstToken = this.lexer.getNextToken()
        const secondToken = this.lexer.getNextToken()
        this.curToken = firstToken
        this.peekToken = secondToken
        // 注册 parse functions
        this.prefixParseFns = {}
        this.infixParseFns = {}
        this.registerPrefix(IDENT, this.parseIdentifier)
        this.registerPrefix(INT, this.parseIntegerLiteral)
        this.registerPrefix(BANG, this.parsePrefixExpression)
        this.registerPrefix(MINUS, this.parsePrefixExpression)
        this.registerPrefix(TRUE, this.parseBoolean)
        this.registerPrefix(FALSE, this.parseBoolean)
        this.registerPrefix(LPAREN, this.parseGroupedExpression)
        this.registerPrefix(RPAREN, this.parseGroupedExpression)
        this.registerPrefix(IF, this.parseIfExpression)
        this.registerPrefix(FUNCTION, this.parseFunctionLiteral)
        this.registerPrefix(STRING, this.parseStringLiteral)   
        // 
        this.registerInfix(PLUS, this.parseInfixExpression)
        this.registerInfix(MINUS, this.parseInfixExpression)
        this.registerInfix(SLASH, this.parseInfixExpression)
        this.registerInfix(ASTERISK, this.parseInfixExpression)
        this.registerInfix(EQ, this.parseInfixExpression)
        this.registerInfix(NOT_EQ, this.parseInfixExpression)
        this.registerInfix(LT, this.parseInfixExpression)
        this.registerInfix(GT, this.parseInfixExpression)
        this.registerInfix(LPAREN, this.parseCallExpression)
    }
    registerPrefix(tokenType, fn) {
        this.prefixParseFns[tokenType] = fn
    }
    registerInfix(tokenType, fn) {
        this.infixParseFns[tokenType] = fn
    }
    nextToken() {
        this.curToken = this.peekToken
        this.peekToken = this.lexer.getNextToken()
    }
    parseProgram() {
        const program = new Program([])
        while(this.curToken.type !== 'EOF') {
            const stmt = this.parseStatement()
            if(stmt !== null) {
                program.appendStatement(stmt)
            }
            this.nextToken()
        }
        return program
    }
    parseStatement() {
        switch(this.curToken.type) {
            case 'LET':
                return this.parseLetStatement()
            case 'RETURN':
                    return this.parseReturnStatement()
            default:
                return this.parseExpressionStatement()
        }
    }
    parseLetStatement() {
        const stmt = new LetStatement(this.curToken)

        if(!this.expectPeek('IDENT')) {
            return null
        }

        stmt.name = new Identifier(this.curToken, this.curToken.literal)

        if(!this.expectPeek(ASSIGN)) {
            return null
        }

        this.nextToken()

        stmt.value = this.parseExpression(getPrecedence(LOWEST))

        // 暂时跳过表达式求值
        if(this.peekTokenIs(SEMICOLON)) {
            this.nextToken()
        }

        return stmt
    }
    parseReturnStatement() {
        const stmt = new ReturnStatement(this.curToken)

        this.nextToken()

        stmt.returnValue = this.parseExpression(getPrecedence(LOWEST))

        if(this.peekTokenIs(SEMICOLON)) {
            this.nextToken()
        }

        return stmt
    }    
    parseExpressionStatement() {
        const stmt = new ExpressionStatement(this.curToken)
        
        stmt.expression = this.parseExpression(getPrecedence(LOWEST))
        // 分号是可选的
        if(this.peekTokenIs(SEMICOLON)) {            
            this.nextToken()
        }

        return stmt
    }    
    parseExpression(precedence) {    
        // console.log('parseExpression precedence&type ', precedence, this.curToken)            
        const prefix = this.prefixParseFns[this.curToken.type]
        // console.log('prefix function', prefix)
        if(prefix === undefined) {
            this.noPrefixParseFnError(this.curToken.type)
            return null
        }
        let leftExp = prefix.call(this)
        // console.log('leftExp ', leftExp, 'peekPrecedence ', this.peekPrecedence())
        while(!this.peekTokenIs(SEMICOLON) && precedence < this.peekPrecedence()) {
            const infix = this.infixParseFns[this.peekToken.type]
            if(infix === undefined) {                
                return leftExp
            }
            this.nextToken()
            // console.log('before infix call, leftExp is ', leftExp)
            leftExp = infix.call(this, leftExp)
            // console.log('after infix call, leftExp is ', leftExp)
        }
        // console.log('最后返回了什么 ', leftExp)
        return leftExp
    }
    parseIdentifier() {    
        return new Identifier(this.curToken, this.curToken.literal)
    }
    parseIntegerLiteral() {
        const integerLiteral = new IntegerLiteral(this.curToken)
        const n = Number(this.curToken.literal)
        if(isNaN(n)) {
            const msg = `could not parse ${this.curToken.literal} as integer`
            console.log(msg)
            this.errors.push(msg)
            return null
        }
        integerLiteral.value = n
        return integerLiteral
    }
    parseBoolean() {
        return new Boolean(this.curToken, this.curTokenIs(TRUE))
    }
    parseGroupedExpression() {        
        this.nextToken()

        const exp = this.parseExpression(getPrecedence(LOWEST))
        
        if(!this.expectPeek(RPAREN)) {
            return null
        }

        return exp
    }
    parseIfExpression() {
        const expression = new IfExpression(this.curToken)

        if(!this.expectPeek(LPAREN)) {
            return null
        }

        this.nextToken()
        expression.condition = this.parseExpression(getPrecedence(LOWEST))

        if(!this.expectPeek(RPAREN)) {
            return null
        }

        if(!this.expectPeek(LBRACE)) {
            return null
        }

        expression.consequence = this.parseBlockStatement()
        
        if(this.peekTokenIs(ELSE)) {
            this.nextToken()
            if(!this.expectPeek(LBRACE)) {
                return null
            }
            expression.alternative = this.parseBlockStatement()
        }

        return expression
    }
    parseBlockStatement() {
        const block = new BlockStatement(this.curToken)
        this.nextToken()
        while(!this.curTokenIs(RBRACE) && !this.curTokenIs(EOF)) {
            const stmt = this.parseStatement()            
            if(stmt !== null) {
                block.statements.push(stmt)
            }
            this.nextToken()
        }
        return block
    }
    parseFunctionLiteral() {
        const fl = new FunctionLiteral(this.curToken)

        if(!this.expectPeek(LPAREN)) {
            return null
        }

        fl.parameters = this.parseFunctionParameters()

        if(!this.expectPeek(LBRACE)) {
            return null
        }

        fl.body = this.parseBlockStatement()

        return fl
    }
    parseFunctionParameters() {
        const identifiers = []

        if(this.peekTokenIs(RPAREN)) {
            this.nextToken()
            return identifiers
        }

        this.nextToken()
        const firstParam = new Identifier(this.curToken, this.curToken.literal)
        identifiers.push(firstParam)

        while(this.peekTokenIs(COMMA)) {
            this.nextToken()
            this.nextToken()
            let param = new Identifier(this.curToken, this.curToken.literal)
            identifiers.push(param)
        }

        if(!this.expectPeek(RPAREN)) {
            return null
        }

        return identifiers
    }
    parseCallExpression(fnexpression) {        
        const exp = new CallExpression(this.curToken, fnexpression)
        exp.arguments = this.parseCallArguments()
        return exp
    }
    parseCallArguments() {
        const args = []
        if(this.peekTokenIs(RPAREN)) {
            this.nextToken()
            return args
        }

        this.nextToken()
        args.push(this.parseExpression(getPrecedence(LOWEST)))

        while(this.peekTokenIs(COMMA)) {
            this.nextToken()
            this.nextToken()
            args.push(this.parseExpression(getPrecedence(LOWEST)))
        }

        if(!this.expectPeek(RPAREN)) {
            return null
        }

        return args
    }
    parsePrefixExpression() {
        const expression = new PrefixExpression(this.curToken, this.curToken.literal)
        this.nextToken()
        expression.right = this.parseExpression(PREFIX)
        return expression
    }
    parseInfixExpression(left) {
        // console.log('parse infix curToken ', this.curToken)
        const expression = new InfixExpression(this.curToken, left, this.curToken.literal)
        const precedence = this.curPrecedence()
        this.nextToken()
        expression.right = this.parseExpression(precedence)

        return expression
    }
    parseStringLiteral() {
        return new StringLiteral(this.curToken, this.curToken.literal)
    }
    curTokenIs(tokenType) {        
        return this.curToken.type === tokenType
    }
    peekTokenIs(tokenType) {        
        return this.peekToken.type === tokenType
    }
    expectPeek(tokenType) {
        // console.log('expect peek', tokenType, ', ', this.peekToken)
        if(this.peekTokenIs(tokenType)) {
            this.nextToken()
            return true
        } else {
            this.peekError(tokenType)
            return false
        }
    }
    peekError(tokenType) {
        const msg = `expected next token to be ${tokenType}, got ${this.peekToken.type} instead`
        console.log(msg)
        this.errors.push(msg)
    }
    noPrefixParseFnError(tokenType) {
        const msg = `no prefix parse function for ${tokenType} found`
        this.errors.push(msg)
        console.log(msg)
    }
    peekPrecedence() {
        const p = getPrecedence(this.peekToken.type)
        if(p !== undefined) {
            return p
        }
        return LOWEST
    }
    curPrecedence() {
        const p = getPrecedence(this.curToken.type)
        if(p !== undefined) {
            return p
        }
        return LOWEST
    }
    errors() {
        return this.errors
    }
}

function main() {
    const text = `
        "hello world"
        `
    const lexer = new Lexer(text, 0, 1, text[0])
    const parser = new Parser(lexer, [])
    const program = parser.parseProgram()
    const stmts = program.statements    
    for(const p of stmts) {        
        console.log(p)
    }
    console.log(`errors: ${parser.errors}`)
    console.log('finished')
}

module.exports = {
    Parser,
}

// main()