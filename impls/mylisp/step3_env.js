const readline = require('readline');
const { readStr } = require('./reader.js');
const { prStr, MalSymbol, MalList, MalVector, MalHashMap } = require('./types.js');
const { Env } = require('./env.js');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

const env = new Env();
env.set(new MalSymbol('+'), (...args) => calculate((a, b) => a + b, args));
env.set(new MalSymbol('-'), (...args) => calculate((a, b) => a - b, args));
env.set(new MalSymbol('*'), (...args) => calculate((a, b) => a * b, args));
env.set(new MalSymbol('/'), (a, b) => a / b);

const calculate = (operation, args) => args.reduce(operation);

const partition = (seq, step) => {

};

const evalAst = (ast, env) => {
    if (ast instanceof MalSymbol) return env.get(ast);

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

    switch (ast.value[0].value) {
        case 'def!':
            return env.set(ast.value[1], EVAL(ast.value[2], env));

        case 'let*':
            const newEnv = new Env(env);
            const bindings = ast.value[1].value;
            for (let i = 0; i < bindings.length; i += 2) {
                newEnv.set(bindings[i], EVAL(bindings[i + 1], newEnv));
            }
            return EVAL(ast.value[2], newEnv);

        default:
            const [fn, ...args] = evalAst(ast, env).value;
            return fn.apply(null, args);
    }
};

const READ = str => readStr(str);

const PRINT = malValue => prStr(malValue);

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
