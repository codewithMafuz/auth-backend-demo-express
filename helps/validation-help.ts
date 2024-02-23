class ValidationCheck {
    static isValidSingleName = (name: string): boolean => name.length >= 2;

    static isValidFullName = (fullname: string): boolean => [2, 3].includes(fullname.split(' ').length);

    static isValidEmailAddress = (email: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    static isValidPassword = (password: string, hard: boolean = false): boolean => {
        const regex = hard ? /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\!\@\#\$\%\^\&\*\(\)])[a-zA-Z\d.$]{8,32}/ : /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d.$]{8,32}/;
        return regex.test(password);
    };

    static generatePassword = (hard: boolean = true) => {
        const allowedCharacters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789' + (hard ? '!@#$%^&*()a' : 'a');
        let password = '';
        for (let i = 0; i < 12; i++) {
            password += allowedCharacters[Math.floor(Math.random() * 72)];
        }
        return password;
    };
}
