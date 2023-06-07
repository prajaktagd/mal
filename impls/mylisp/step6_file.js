const readline = require('readline');
const { readStr, NoInputException } = require('./reader.js');
const { prStr, MalSymbol, MalList, MalVector, MalHashMap, MalNil, MalFunction, MalString } = require('./types.js');
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
    while (true) {
        if (!(ast instanceof MalList)) return evalAst(ast, env);
        if (ast.isEmpty()) return ast;

        switch (ast.value[0].value) {
            case 'def!':
                return env.set(ast.value[1], EVAL(ast.value[2], env));

            case 'let*':
                const newEnv = createEnv(env);
                const binds = ast.value[1].value;
                for (let i = 0; i < binds.length; i += 2) {
                    newEnv.set(binds[i], EVAL(binds[i + 1], newEnv));
                }
                ast = new MalList([new MalSymbol('do'), ...ast.value.slice(2)]);
                env = newEnv;
                break;

            case 'do':
                ast.value.slice(1, -1).reduce((_, statement) => EVAL(statement, env), 0);
                ast = ast.value[ast.value.length - 1];
                break;

            case 'if':
                ast = isTrue(ast.value[1], env)
                    ? ast.value[2]
                    : ast.value[3] !== undefined ? ast.value[3] : new MalNil();
                break;

            case 'fn*':
                const doForms = new MalList([new MalSymbol('do'), ...ast.value.slice(2)]);
                const bindsList = ast.value[1].value;
                const func = (...args) => {
                    const newEnv = createEnv(env, bindsList, args);
                    return EVAL(doForms, newEnv);
                };
                return new MalFunction(doForms, bindsList, env, func);

            default:
                const [fn, ...args] = evalAst(ast, env).value;
                return fn.apply(null, args);
        }
    }
};

const READ = (str) => readStr(str);

const PRINT = (malValue) => prStr(malValue, true);

const rep = (str, env) => PRINT(EVAL(READ(str), env));

const repl = (env) => rl.question('user> ', line => {
    try {
        console.log(rep(line, env));
    } catch (error) {
        !(error instanceof NoInputException) && console.log(error);
    } finally {
        repl(env);
    }
});

const main = () => {
    const env = createEnv();

    Object.entries(ns).forEach(([symbol, value]) => env.set(new MalSymbol(symbol), value));

    rep('(def! not (fn* [a] (if a false true)))', env);
    rep('(def! load-file (fn* (f) (eval (read-string (str "(do " (slurp f) "\nnil)")))))', env);

    env.set(new MalSymbol('eval'), (ast) => EVAL(ast, env));
    env.set(new MalSymbol('*ARGV*'), new MalList([]));

    if (process.argv.length >= 3) {
        const argv = process.argv.slice(3).map((arg) => new MalString(arg));
        env.set(new MalSymbol('*ARGV*'), new MalList(argv));

        rep(`(load-file "${process.argv[2]}")`, env);
        return rl.close();
    }
    repl(env);
};

main();
