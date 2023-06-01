const { deepEqual } = require('./deepEqual.js');
const { prStr, MalNil, MalList } = require('./types.js');

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

const prn = (...args) => {
    console.log(...args.map(prStr));
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
    'prn': prn,
    'println': prn,
    'pr-str': prn,
    'list': (...args) => new MalList(args),
    'count': count,
    'empty?': isEmpty,
    'list?': (a) => a instanceof MalList
};

module.exports = { ns };
