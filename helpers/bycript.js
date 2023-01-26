const bcrypt = require("bcryptjs");

const hashPassword = (password) => {
  return bcrypt.hashSync(password, 8);
};

const verifyPassword = (password, hashPassword) => {
  return bcrypt.compareSync(password, hashPassword);
};

module.exports = { hashPassword, verifyPassword };
