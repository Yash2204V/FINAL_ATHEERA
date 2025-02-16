const jwt = require("jsonwebtoken");
const { JWT_SECRET, JWT_EXPIRES_IN } = require("../config/environment");

const generateToken = (_id) => {
    const token = jwt.sign({ _id: _id.toString() }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    return token;
}

module.exports = generateToken;