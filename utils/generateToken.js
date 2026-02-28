const jwt = require("jsonwebtoken");

const getJwtSecret = () => process.env.JWT_SECRET || "local_dev_jwt_secret_change_later";

const generateToken = (id, role) =>
  jwt.sign({ id, role }, getJwtSecret(), {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

module.exports = generateToken;
