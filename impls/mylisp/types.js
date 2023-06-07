const areBothArrays = (element1, element2) => {
    return Array.isArray(element1) && Array.isArray(element2);
};

const deepEqual = (element1, element2) => {
    if (element1 instanceof MalValue) {
        return element1.equals(element2);
    }
    if (!areBothArrays(element1, element2)) {
        return element1 === element2;
    }
    if (element1.length !== element2.length) {
        return false;
    }
    for (let index = 0; index < element1.length; index++) {
        if (!deepEqual(element1[index], element2[index])) {
            return false;
        }
    }
    return true;
};

const toPrintedRepresentation = (str) => str
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/\"/g, '\\\"');

const prStr = (malValue, printReadably) => {
    if (typeof malValue === 'function') return '#<function>';

    if (malValue instanceof MalValue) {
        if (printReadably && malValue instanceof MalString) {
            return `"${toPrintedRepresentation(malValue.prStr(printReadably))}"`;
        }
        return malValue.prStr(printReadably);
    }

    return malValue.toString();
};

const prSeqElements = (seq, printReadably, separator) =>
    seq.map((element) => prStr(element, printReadably)).join(separator);

class MalValue {
    constructor(value) {
        this.value = value;
    }

    prStr(printReadably) {
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

    equals(otherMalList) {
        return otherMalList instanceof MalSequence && deepEqual(this.value, otherMalList.value);
    }
}

class MalString extends MalValue {
    constructor(value) {
        super(value);
    }

    prStr(printReadably) {
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

    prStr(printReadably) {
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

    prStr(printReadably) {
        return '(' + prSeqElements(this.value, printReadably, ' ') + ')';
    }
}

class MalVector extends MalSequence {
    constructor(value) {
        super(value);
    }

    prStr(printReadably) {
        return '[' + prSeqElements(this.value, printReadably, ' ') + ']';
    }
}

class MalNil extends MalValue {
    constructor() {
        super(null);
    }

    prStr(printReadably) {
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

    prStr(printReadably) {
        const pairs = this.value.map(([k, v]) => {
            return `${prStr(k, printReadably)} ${prStr(v, printReadably)}`;
        });
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

    prStr(printReadably) {
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

    prStr(printReadably) {
        return `(atom ${this.value})`;
    }

    equals(otherMalAtom) {
        return otherMalAtom instanceof MalAtom && deepEqual(this.value, otherMalAtom.value);
    }
}

module.exports = {
    MalValue, MalSymbol, MalSequence, MalList, MalVector, MalNil, MalHashMap, MalString,
    MalFunction, MalAtom, MalKeyword, deepEqual, prStr, prSeqElements
};
