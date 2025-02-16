const nodemailer = require("nodemailer");
const { EMAIL, APP_PASSWORD } = require("../config/environment");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: EMAIL,
        pass: APP_PASSWORD,
    },
});

module.exports = transporter;