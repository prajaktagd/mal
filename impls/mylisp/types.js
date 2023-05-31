const prSeqElements = (seq) => seq.map(prStr).join(" ");

const prStr = (malValue) => {
    if (malValue instanceof MalValue) {
        return malValue.prStr();
    }
    if ((typeof malValue) === 'function') {
        return '#<function>';
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
        return "(" + prSeqElements(this.value) + ")";
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
        return "[" + prSeqElements(this.value) + "]";
    }
}

class MalNil extends MalValue {
    constructor() {
        super(null);
    }

    prStr() {
        return "nil";
    }
}

class MalHashMap extends MalValue {
    constructor(value) {
        super(value);
    }

    prStr() {
        const pairs = this.value.map(([k, v]) => `${prStr(k)} ${prStr(v)}`);
        return "{" + pairs.join(" ") + "}";
    }
}

module.exports = {
    MalValue, MalSymbol, MalList, MalVector, MalNil, MalHashMap, prStr
};
