const { deepEqual } = require('./deepEqual.js');
const { readStr } = require('./reader.js');
const { prStr, MalNil, MalList, MalString, MalAtom } = require('./types.js');
const fs = require('fs');

const calculate = (operation, args) => args.reduce(operation);

const count = (a) => {
    if (a.value === undefined) {
        throw "count not supported on this type";
    }
    return (a.value !== null) ? a.value.length : 0;
};

const isEmpty = (a) => {
    if (a.value === undefined) {
        throw "Don't know how to create ISeq from this type";
    }
    return a.value === null ? true : a.value.length === 0;
};

const print = (args, printReadably) => {
    console.log(...args.map((arg) => prStr(arg, printReadably)));
    return new MalNil();
};

const ns = {
    '+': (...args) => calculate((a, b) => a + b, args),
    '-': (...args) => calculate((a, b) => a - b, args),
    '*': (...args) => calculate((a, b) => a * b, args),
    '/': (a, b) => a / b,
    '<': (a, b) => a < b,
    '>': (a, b) => a > b,
    '<=': (a, b) => a <= b,
    '>=': (a, b) => a >= b,
    '=': (a, b) => deepEqual(a, b),
    'prn': (...args) => print(args, true),
    'println': (...args) => print(args, false),
    'pr-str': (...args) => {
        const str = args.map((arg) => prStr(arg, true)).join(' ');
        return new MalString(str);
    },
    'str': (...args) => {
        const str = args.map((arg) => prStr(arg, false)).join('');
        return new MalString(str);
    },
    'list': (...args) => new MalList(args),
    'count': count,
    'empty?': isEmpty,
    'list?': (a) => a instanceof MalList,
    'read-string': (str) => readStr(str.value),
    'slurp': (filename) => new MalString(fs.readFileSync(filename.value, 'utf8')),
    'atom': (malValue) => new MalAtom(malValue),
    'atom?': (atom) => atom instanceof MalAtom,
    'deref': (atom) => atom.deref(),
    'reset!': (atom, malValue) => atom.reset(malValue),
    'swap!': (atom, func, ...args) => atom.swap(func, args)
};

module.exports = { ns };
