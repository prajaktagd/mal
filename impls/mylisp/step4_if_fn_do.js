const readline = require('readline');
const { readStr } = require('./reader.js');
const { prStr, MalSymbol, MalList, MalVector, MalHashMap, MalNil } = require('./types.js');
const { createEnv } = require('./env.js');
const { ns } = require('./core.js');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

const isFalsy = (element) => element instanceof MalNil || element === false;
const isTrue = (predicate, env) => !isFalsy(EVAL(predicate, env));

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
                : ast.value[3] !== undefined ? EVAL(ast.value[3], env) : new MalNil();

        case 'fn*':
            return (...args) => {
                const newEnv = createEnv(env, ast.value[1].value, args);
                const doList = [new MalSymbol('do'), ...ast.value.slice(2)];
                return EVAL(new MalList(doList), newEnv);
            }

        default:
            const [fn, ...args] = evalAst(ast, env).value;
            return fn.apply(null, args);
    }
};

const READ = (str) => readStr(str);

const PRINT = (malValue) => prStr(malValue);

const rep = (str, env) => PRINT(EVAL(READ(str), env));

const repl = (env) => rl.question('user> ', line => {
    try {
        console.log(rep(line, env));
    } catch (error) {
        console.log(error);
    }
    repl(env);
});

const env = createEnv();
Object.entries(ns).forEach(([symbol, value]) => env.set(new MalSymbol(symbol), value));
env.set(new MalSymbol('not'), (a) => rep(`((fn* [a] (if a false true)) ${prStr(a)})`, env));

repl(env);
