const {Lexer} = require("../lexer");
const {monkeyEval} = require("../evaluator");
const {Environment} = require("../evaluator");
const {Parser} = require("../parser");


function testBinding() {
    const text = `let two = "two";`
    const lexer = new Lexer(text, 0, 1, text[0])
    const parser = new Parser(lexer, [])
    const program = parser.parseProgram()
    const env = new Environment()
    // console.log('env', env)
    // const stmts = program.statements
    // const r =  evalStatements(stmts)
    const r = monkeyEval(program, env)
    console.log('result ', r)
    // for(const item of r.elements) {
    //     console.log('item ', item)
    // }
    console.log('env', env)

}

function main() {
    testBinding()
}

main()
