const { MalValue } = require('./types.js');

const areBothArrays = (element1, element2) => {
    return Array.isArray(element1) && Array.isArray(element2);
};

const deepEqual = (malValue1, malValue2) => {
    const list1 = malValue1 instanceof MalValue ? malValue1.value : malValue1;
    const list2 = malValue2 instanceof MalValue ? malValue2.value : malValue2;

    if (!areBothArrays(list1, list2)) {
        return list1 === list2;
    }
    if (list1.length !== list2.length) {
        return false;
    }
    for (let index = 0; index < list1.length; index++) {
        if (!deepEqual(list1[index], list2[index])) {
            return false;
        }
    }
    return true;
};

exports.deepEqual = deepEqual;
