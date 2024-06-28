const bcrypt = require('bcryptjs');

const password = 'proyecto2024';
const salt = bcrypt.genSaltSync(10);
const hashedPassword = bcrypt.hashSync(password, salt);

console.log(hashedPassword);
