const readline = require('readline');
const { readStr } = require('./reader.js');
const { prStr } = require('./types.js');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

const READ = str => readStr(str);
const EVAL = str => str;
const PRINT = malValue => prStr(malValue);

const rep = str => PRINT(EVAL(READ(str)));

const repl = () => rl.question('user> ', line => {
    try {
        console.log(rep(line));
    } catch (error) {
        console.log(error);
    }
    repl();
});

repl();
