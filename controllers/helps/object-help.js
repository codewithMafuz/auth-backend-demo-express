
const nestedObjectStringsModify = (obj = {}, modifyFunc = (str) => str.trim()) => {
    if ((typeof (obj) !== "object") || (JSON.stringify(obj).length === 2)) return
    for (const [key, val] of Object.entries(obj)) {
        if (typeof (val) === 'object' && !Array.isArray(val)) {
            nestedObjectStringsModify(val, modifyFunc)
        }
        else if (typeof (val) === "string") {
            obj[key] = modifyFunc(val)
        }
    }
}

const nestedObjectNumbersModify = (obj, modifyFunc = (num) => num.toFixed(2)) => {
    for (const [key, val] of Object.entries(obj)) {
        if (typeof (val) === 'object' && !Array.isArray(val)) {
            nestedObjectStringsModify(val, modifyFunc)
        }
        else if (typeof (val) === "number") {
            obj[key] = modifyFunc(val)
        }
    }
}


export {
    nestedObjectStringsModify,
    nestedObjectNumbersModify,
}