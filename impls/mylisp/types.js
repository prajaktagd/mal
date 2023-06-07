const { deepEqual } = require('./deepEqual.js');

const prSeqElements = (seq) => seq.map(prStr).join(' ');

const toPrintedRepresentation = (str) => str
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/\"/g, '\\\"');

const prStr = (malValue, printReadably = true) => {
    if (typeof malValue === 'function') return '#<function>';
    if (malValue instanceof MalValue) {
        if (printReadably && malValue instanceof MalString) {
            return `"${toPrintedRepresentation(malValue.prStr())}"`;
        }
        return malValue.prStr();
    }

    return malValue.toString();
};

class MalValue {
    constructor(value) {
        this.value = value;
    }

    prStr() {
        return this.value.toString();
    }
}

class MalSequence extends MalValue {
    constructor(value) {
        super([...value]);
    }

    isEmpty() {
        return this.value.length === 0;
    }

    beginsWith(symbol) {
        return !(this.isEmpty()) && (this.value[0].value === symbol);
    }

    nth(n) {
        if (n >= this.value.length) {
            throw 'index out of bound';
        }
        return this.value[n];
    }

    first() {
        return this.isEmpty() ? new MalNil() : this.value[0];
    }

    rest() {
        return new MalList(this.value.slice(1));
    }
}

class MalString extends MalValue {
    constructor(value) {
        super(value);
    }

    prStr() {
        return this.value;
    }

    equals(otherMalString) {
        return otherMalString instanceof MalString && deepEqual(this.value, otherMalString.value);
    }
}

class MalKeyword extends MalValue {
    constructor(value) {
        super(value);
    }

    prStr() {
        return `:${this.value}`;
    }

    equals(otherMalKeyword) {
        return otherMalKeyword instanceof MalKeyword && deepEqual(this.value, otherMalKeyword.value);
    }
}

class MalSymbol extends MalValue {
    constructor(value) {
        super(value);
    }

    equals(otherMalSymbol) {
        return otherMalSymbol instanceof MalSymbol && deepEqual(this.value, otherMalSymbol.value);
    }
}

class MalList extends MalSequence {
    constructor(value) {
        super(value);
    }

    prStr() {
        return '(' + prSeqElements(this.value) + ')';
    }

    equals(otherMalList) {
        return otherMalList instanceof MalList && deepEqual(this.value, otherMalList.value);
    }
}

class MalVector extends MalSequence {
    constructor(value) {
        super(value);
    }

    prStr() {
        return '[' + prSeqElements(this.value) + ']';
    }

    equals(otherMalVector) {
        return otherMalVector instanceof MalVector && deepEqual(this.value, otherMalVector.value);
    }
}

class MalNil extends MalValue {
    constructor() {
        super(null);
    }

    prStr() {
        return 'nil';
    }

    equals(otherMalNil) {
        return otherMalNil instanceof MalNil && deepEqual(this.value, otherMalNil.value);
    }
}

class MalHashMap extends MalValue {
    constructor(value) {
        super(value);
    }

    prStr() {
        const pairs = this.value.map(([k, v]) => `${prStr(k)} ${prStr(v)}`);
        return '{' + pairs.join(' ') + '}';
    }

    equals(otherMalHashMap) {
        return otherMalHashMap instanceof MalHashMap && deepEqual(this.value, otherMalHashMap.value);
    }
}

class MalFunction extends MalValue {
    constructor(ast, binds, env, func, isMacro = false) {
        super(ast);
        this.binds = binds;
        this.env = env;
        this.func = func;
        this.isMacro = isMacro
    }

    apply(context, args) {
        return this.func.apply(context, args);
    }

    prStr() {
        return '#<function>';
    }

    equals(otherMalFunction) {
        return otherMalFunction instanceof MalFunction && deepEqual(this.value, otherMalFunction.value);
    }
}

class MalAtom extends MalValue {
    constructor(value) {
        super(value);
    }

    deref() {
        return this.value;
    }

    reset(malValue) {
        this.value = malValue;
        return this.value;
    }

    swap(func, args) {
        this.value = func.apply(null, [this.value, ...args]);
        return this.value;
    }

    prStr() {
        return `(atom ${this.value})`;
    }

    equals(otherMalAtom) {
        return otherMalAtom instanceof MalAtom && deepEqual(this.value, otherMalAtom.value);
    }
}

module.exports = {
    MalValue, MalSymbol, MalSequence, MalList, MalVector, MalNil, MalHashMap, MalString,
    MalFunction, MalAtom, MalKeyword, prStr
};
