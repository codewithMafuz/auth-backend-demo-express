const isValidSingleName = (name) => name.length >= 2;

const isValidFullName = (fullname) => [2, 3].includes(fullname.split(' ').length);

const isValidEmailAddress = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const isValidPasswordHard = (password) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\!\@\#\$\%\^\&\*\(\)])[a-zA-Z\d.$]{8,32}/.test(password)

const isValidPasswordNormal = (password) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d.$]{8,32}/.test(password)

const validationTypesFunc = {
    singleName: isValidSingleName,
    fullName: isValidFullName,
    name: isValidFullName,
    email: isValidEmailAddress,
    password: isValidPasswordNormal,
}

const checkValidation = (typesAndValues = { singleName: false, fullName: false, email: false, password: false }) => {
    const errors = {}
    for (const [type, typeValue] of Object.entries(typesAndValues)) {
        if (type && type in validationTypesFunc) {
            const isValid = validationTypesFunc[type](typeValue)
            if (!isValid) {
                errors[type] = true
            }
        }
    }
    return Object.keys(errors).length === 0 ? { errors: false } : { errors: errors }
}


const generatePassword = (hard = false) => {
    const allowedCharacters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789' + (hard ? '!@#$%^&*()a' : 'a');
    let password = '';
    for (let i = 0; i < 12; i++) {
        password += allowedCharacters[Math.floor(Math.random() * 72)];
    }
    return password;
};


export {
    isValidSingleName,
    isValidFullName,
    isValidEmailAddress,
    isValidPasswordNormal,
    isValidPasswordHard,
    checkValidation,
    generatePassword,
}