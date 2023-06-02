const readline = require('readline');
const { readStr } = require('./reader.js');
const { prStr, MalSymbol, MalList, MalVector, MalHashMap } = require('./types.js');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

const calculate = (operation, args) => args.reduce(operation);

const env = {
    '+': (...args) => calculate((a, b) => a + b, args),
    '-': (...args) => calculate((a, b) => a - b, args),
    '*': (...args) => calculate((a, b) => a * b, args),
    '/': (a, b) => a / b
};

const evalAst = (ast, env) => {
    if (ast instanceof MalSymbol) return env[ast.value];

    if (ast instanceof MalList) {
        const newAst = ast.value.map((x) => EVAL(x, env));
        return new MalList(newAst);
    }

    if (ast instanceof MalVector) {
        const newAst = ast.value.map((x) => EVAL(x, env));
        return new MalVector(newAst);
    }

    if (ast instanceof MalHashMap) {
        const newAst = ast.value.map(([k, v]) => [EVAL(k, env), EVAL(v, env)]);
        return new MalHashMap(newAst);
    }

    return ast;
};

const EVAL = (ast, env) => {
    if (!(ast instanceof MalList)) return evalAst(ast, env);

    if (ast.isEmpty()) return ast;

    const [fn, ...args] = evalAst(ast, env).value;
    return fn.apply(null, args);
};

const READ = str => readStr(str);

const PRINT = malValue => prStr(malValue, true);

const rep = str => PRINT(EVAL(READ(str), env));

const repl = () => rl.question('user> ', line => {
    try {
        console.log(rep(line));
    } catch (error) {
        console.log(error);
    }
    repl();
});

repl();
