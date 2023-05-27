const { MalValue, MalList, MalVector, MalSymbol, MalNil, MalHashMap } = require('./types');

class Reader {
    constructor(tokens) {
        this.tokens = tokens;
        this.position = 0;
    }

    peek() {
        return this.tokens[this.position];
    }

    next() {
        const token = this.peek();
        this.position++;
        return token;
    }
}

const tokenize = (str) => {
    const re = /[\s,]*(~@|[\[\]{}()'`~^@]|"(?:\\.|[^\\"])*"?|;.*|[^\s\[\]{}('"`,;)]*)/g;
    return [...str.matchAll(re)].map((x) => x[1]).slice(0, -1);
};

const readSeq = (reader, closingSymbol) => {
    reader.next();
    const ast = [];

    while (reader.peek() !== closingSymbol) {
        if (reader.peek() === undefined) {
            throw 'unbalanced';
        }
        ast.push(readForm(reader));
    }

    reader.next();
    return ast;
};

const readList = (reader) => new MalList(readSeq(reader, ')'));
const readVector = (reader) => new MalVector(readSeq(reader, ']'));
const readHashMap = (reader) => new MalHashMap(readSeq(reader, '}'));

const readAtom = (reader) => {
    const token = reader.next();

    if (token.match(/^-?[0-9]+$/)) {
        return new MalValue(parseInt(token));
    }
    if (token === 'true') {
        return true;
    }
    if (token === 'false') {
        return false;
    }
    if (token === 'nil') {
        return new MalNil();
    }
    return new MalSymbol(token);
};

const readForm = (reader) => {
    const token = reader.peek();
    switch (token) {
        case '(':
            return readList(reader);
        case '[':
            return readVector(reader);
        case '{':
            return readHashMap(reader);
        default:
            return readAtom(reader);
    }
};

const readStr = (str) => {
    const tokens = tokenize(str);
    const reader = new Reader(tokens);
    return readForm(reader);
};

module.exports = { readStr };
