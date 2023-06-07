const fs = require('fs');
const { readStr } = require('./reader.js');
const { MalNil, MalList, MalString, MalAtom, MalVector, MalValue,
    prSeqElements, deepEqual } = require('./types.js');

const calculate = (operation, args) => args.reduce(operation);

const count = (a) => {
    if (a.value === undefined) {
        throw "count not supported on this type";
    }
    return (a.value !== null) ? a.value.length : 0;
};

const isEmpty = (a) => {
    if (a.value === undefined) {
        throw "don't know how to create ISeq from this type";
    }
    return a.value === null ? true : a.value.length === 0;
};

const print = (args, printReadably) => {
    console.log(prSeqElements(args, printReadably, ' '));
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
    '=': (a, b) => a instanceof MalValue ? a.equals(b) : deepEqual(a, b),
    'count': count,
    'empty?': isEmpty,
    'prn': (...args) => print(args, true),
    'println': (...args) => print(args, false),
    'pr-str': (...args) => new MalString(prSeqElements(args, true, ' ')),
    'str': (...args) => new MalString(prSeqElements(args, false, '')),
    'read-string': (str) => readStr(str.value),
    'list': (...args) => new MalList(args),
    'list?': (a) => a instanceof MalList,
    'slurp': (filename) => new MalString(fs.readFileSync(filename.value, 'utf8')),
    'atom': (malValue) => new MalAtom(malValue),
    'atom?': (atom) => atom instanceof MalAtom,
    'deref': (atom) => atom.deref(),
    'reset!': (atom, malValue) => atom.reset(malValue),
    'swap!': (atom, func, ...args) => atom.swap(func, args),
    'cons': (value, list) => new MalList([value, ...list.value]),
    'concat': (...lists) => new MalList(lists.flatMap((list) => list.value)),
    'vec': (list) => new MalVector(list.value),
    'nth': (list, n) => list.nth(n),
    'first': (list) => list instanceof MalNil ? list : list.first(),
    'rest': (list) => list instanceof MalNil ? new MalList([]) : list.rest(),
};

module.exports = { ns };
