const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config/environment");
const User = require("../models/user.model");
const dbgr = require("debug")("development: middleware");

const adminAuthMiddleware = async (req, res, next) => {
    try {

        // 🍪 Grab the token from cookies
        const token = req.cookies?.token;
        if (!token) {
            dbgr("⚠️ No token found! Redirecting to login...");
            return res.redirect("/user/login");
        }

        // 🔍 Verify token and decode user details
        const decoded = jwt.verify(token, JWT_SECRET);
        const admin = await User.findOne({ _id: decoded._id, "tokens.token": token });

        if (admin && admin.role === "admin") {
            req.admin = admin;
            dbgr(`✅ Admin authenticated: ${admin.email}`);
            next();
        } else {
            throw new Error("❌ Invalid token or user not found");
        }
    } catch (err) {
        dbgr(`❌ Authentication Error: ${err.message}`);
        res.clearCookie("token"); // 🚫 Clear the invalid token
        res.status(401).redirect("/user/login");
    }
};

module.exports = adminAuthMiddleware;