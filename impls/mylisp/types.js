const prSeqElements = (seq) => seq.map(prStr).join(' ');

const toPrintedRepresentation = (str) => {
    const newLocal = str
        .replace(/\\/g, '\\\\')
        .replace(/\n/g, '\\n')
        .replace(/\"/g, '\\\"');
    return newLocal;
};

const prStr = (malValue, printReadably) => {
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

class MalString extends MalValue {
    constructor(value) {
        super(value);
    }

    prStr() {
        return this.value;
    }
}

class MalSymbol extends MalValue {
    constructor(value) {
        super(value);
    }
}

class MalList extends MalValue {
    constructor(value) {
        super([...value]);
    }

    prStr() {
        return '(' + prSeqElements(this.value) + ')';
    }

    isEmpty() {
        return this.value.length === 0;
    }
}

class MalVector extends MalValue {
    constructor(value) {
        super([...value]);
    }

    prStr() {
        return '[' + prSeqElements(this.value) + ']';
    }
}

class MalNil extends MalValue {
    constructor() {
        super(null);
    }

    prStr() {
        return 'nil';
    }
}

class MalHashMap extends MalValue {
    constructor(value) {
        super(value);
    }

    prStr() {
        const pairs = this.value.map(([k, v]) => `${prStr(k)} ${prStr(v)} `);
        return '{' + pairs.join(' ') + '}';
    }
}

class MalFunction extends MalValue {
    constructor(ast, binds, env) {
        super(ast);
        this.binds = binds;
        this.env = env;
    }

    prStr() {
        return '#<function>';
    }
}

module.exports = {
    MalValue, MalSymbol, MalList, MalVector, MalNil, MalHashMap, MalString,
    MalFunction, prStr
};
