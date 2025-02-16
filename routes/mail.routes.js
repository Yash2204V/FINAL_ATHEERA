const express = require("express");
const authMiddleware = require("../middlewares/auth-middleware");
const router = express.Router();
const {singleProductMail, multipleProductMail} = require("../controllers/mail.controller");

// 📩 Send Mail: Single Product 🛍️
router.get("/single/:productid", authMiddleware, singleProductMail);

// 📩 Send Mail: Multiple Products 📦📦
router.get("/multiple", authMiddleware, multipleProductMail);

module.exports = router;
