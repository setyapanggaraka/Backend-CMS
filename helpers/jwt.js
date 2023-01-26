const jwt = require("jsonwebtoken");

const generateToken = (payload) => {
  return jwt.sign(payload, "shhhhh");
};

const verifyToken = (token) => {
  return jwt.verify(token, "shhhhh");
};

module.exports = { generateToken, verifyToken };
