class Env {
    constructor(outer) {
        this.outer = outer;
        this.data = {};
    }

    set(symbol, malValue) {
        this.data[symbol.value] = malValue;
        return this.data[symbol.value];
    }

    find(symbol) {
        if (this.data[symbol.value]) {
            return this;
        }
        if (this.outer) {
            return this.outer.find(symbol);
        }
    }

    get(symbol) {
        const env = this.find(symbol);
        if (!env) {
            throw `${symbol.value} not found`;
        }
        return env.data[symbol.value];
    }
}

const createEnv = (outer, binds, exprs) => {
    const env = new Env(outer);

    if (binds && exprs) {
        for (let i = 0; i < binds.length; i++) {
            env.set(binds[i], exprs[i]);
        }
    }
    return env;
};

module.exports = { createEnv };
