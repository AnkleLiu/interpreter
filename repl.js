const readline = require('readline');
const { Lexer } = require('./lexer')
const { Parser } = require('./parser')
const { monkeyEval, Environment, } = require('./evaluator')
// const { Environment, } = require('./object')

const MONKEY_FACE = `            __,__
   .--.  .-"     "-.  .--.
  / .. \/  .-. .-.  \/ .. \
 | |  '|  /   Y   \  |'  | |
 | \   \  \ 0 | 0 /  /   / |
  \ '- ,\.-"""""""-./, -' /
   ''-' /_   ^ ^   _\ '-''
       |  \._   _./  |
       \   \ '~' /   /
        '._ '-=-' _.'
           '-----'
`
function printParserErrors(errors) {
	console.log(MONKEY_FACE)
	console.log("Woops! We ran into some monkey business here!\n")
	console.log(" parser errors:\n")
	for(const e of errors) {
		console.log("\t" + e + "\n")
	}
}

function initEnvironment() {
    return new Environment()
}

function main() {
    // 把环境定义在这里，不然每次输入都会有一个新的环境    
    const env = new Environment() 
    const prompt = ">>> "
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: prompt,
    });

    rl.write('欢迎来到 Monkey\r\n')    
    rl.prompt()

    rl.on('line', (input) => {        
        const lexer = new Lexer(input, 0, 1, input[0])
        const parser = new Parser(lexer, [])
        const program = parser.parseProgram()  
                       
        if(parser.errors.length > 0) {
            printParserErrors(parser.errors)            
        } else {
            // 测试 evaluator            
            const value = monkeyEval(program, env)            
            if(value !== null) {
                console.log(value.inspect())
            } else {
                console.log('还不支持噢，正在完善中……')
            }
            // 测试 parser
            // const stmts = program.statements            
            // for(const p of stmts) {        
            //     console.log(p.toString())
            // }
        }
        // 测试 token
        // for(let tok = lexer.getNextToken(); tok.type !== 'EOF'; tok = lexer.getNextToken()) {
        //     console.log(`${tok}`)            
        // }
        rl.prompt()
    });

    rl.on('close', () => {        
        console.log('Bye!');
    });
}

main()