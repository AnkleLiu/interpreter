const [
    EOF, ASSIGN, SEMICOLON, LPAREN, RPAREN, ILLEGAL, FUNCTION, LET, IDENT,
    INT, SLASH, ASTERISK, LT, GT, COMMA, LBRACE, RBRACE, BANG, NOT_EQ, 
    PLUS, MINUS, EQ, IF, ELSE, TRUE, FALSE, RETURN,
    STRING, LBRACKET, RBRACKET,
] = [
    'EOF', 'ASSIGN', 'SEMICOLON', 'LPAREN', 'RPAREN', 'ILLEGAL', 'FUNCTION', 'LET', 'IDENT',
    'INT', 'SLASH', 'ASTERISK', 'LT', 'GT', 'COMMA', 'LBRACE', 'RBRACE', 'BANG', 'NOT_EQ',
    'PLUS', 'MINUS', 'EQ', 'IF', 'ELSE', 'TRUE', 'FALSE', 'RETURN',
    'STRING', 'LBRACKET', 'RBRACKET',
]

const [_, LOWEST, EQUALS, LESSGREATER, SUM, PRODUCT, PREFIX, CALL] = [
    '_', 'LOWEST', 'EQUALS', 'LESSGREATER', 'SUM', 'PRODUCT', 'PREFIX', 'CALL',
]

module.exports = {
    EOF, ASSIGN, SEMICOLON, LPAREN, RPAREN, ILLEGAL, FUNCTION, LET, IDENT,
    INT, SLASH, ASTERISK, LT, GT, COMMA, LBRACE, RBRACE, BANG, NOT_EQ, 
    PLUS, MINUS, EQ, IF, ELSE, TRUE, FALSE, RETURN,
    STRING, LBRACKET, RBRACKET,
    _, LOWEST, EQUALS, LESSGREATER, SUM, PRODUCT, PREFIX, CALL,
}