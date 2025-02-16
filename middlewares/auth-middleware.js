const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config/environment");
const User = require("../models/user.model");
const dbgr = require("debug")("development: middleware");

const authMiddleware = async (req, res, next) => {
    try {
        // 🍪 Grab the token from cookies
        const token = req.cookies?.token;
        if (!token) {
            dbgr("⚠️ No token found! Redirecting to login...");
            return res.redirect("/user/login");
        }

        // 🔍 Verify token and decode user details
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findOne({ _id: decoded._id, "tokens.token": token });

        if (!user) {
            throw new Error("❌ Invalid token or user not found");
        }

        // ✅ Attach user and token to request
        req.user = user;
        req.token = token;
        dbgr(`✅ User authenticated: ${user.email}`);
        next();
        
    } catch (err) {
        dbgr(`❌ Authentication Error: ${err.message}`);
        res.clearCookie("token"); // 🚫 Clear the invalid token
        res.status(401).redirect("/user/login");
    }
};

module.exports = authMiddleware;
