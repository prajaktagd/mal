const readline = require('readline');
const { readStr } = require('./reader.js');
const { prStr, MalSymbol, MalList, MalVector, MalHashMap } = require('./types.js');
const { createEnv } = require('./env.js');
const { MalNil } = require('./types.js');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

const prn = (...args) => {
    const evaluatedArgs = args.map((arg) => EVAL(arg, env));
    console.log(...evaluatedArgs);
    return new MalNil();
};

const calculate = (operation, args) => args.reduce(operation);

const isTrue = (predicate, env) => {
    const evaluatedPred = EVAL(predicate, env);
    return !(evaluatedPred instanceof MalNil || evaluatedPred === false);
};

const env = createEnv();
env.set(new MalSymbol('+'), (...args) => calculate((a, b) => a + b, args));
env.set(new MalSymbol('-'), (...args) => calculate((a, b) => a - b, args));
env.set(new MalSymbol('*'), (...args) => calculate((a, b) => a * b, args));
env.set(new MalSymbol('/'), (a, b) => a / b);
env.set(new MalSymbol('<'), (a, b) => a < b);
env.set(new MalSymbol('>'), (a, b) => a > b);
env.set(new MalSymbol('<='), (a, b) => a <= b);
env.set(new MalSymbol('>='), (a, b) => a >= b);
env.set(new MalSymbol('='), (a, b) => a === b);
env.set(new MalSymbol('not'), (a) => !a);
env.set(new MalSymbol('prn'), prn);
env.set(new MalSymbol('println'), prn);
env.set(new MalSymbol('pr-str'), prn);
env.set(new MalSymbol('list'), (...args) => new MalList(args));

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
            const newEnv = createEnv(env);
            const bindings = ast.value[1].value;
            for (let i = 0; i < bindings.length; i += 2) {
                newEnv.set(bindings[i], EVAL(bindings[i + 1], newEnv));
            }
            return EVAL(ast.value[2], newEnv);

        case 'do':
            return ast.value.slice(1).reduce((_, statement) => EVAL(statement, env), 0);

        case 'if':
            return isTrue(ast.value[1], env)
                ? EVAL(ast.value[2], env)
                : ast.value[3] ? EVAL(ast.value[3], env) : new MalNil();

        case 'fn*':
            return (...args) => {
                const newEnv = createEnv(env, ast.value[1].value, args);
                return EVAL(ast.value[2], newEnv);
            }

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
