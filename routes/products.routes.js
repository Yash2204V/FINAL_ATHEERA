const express = require("express");
const authMiddleware = require("../middlewares/auth-middleware");
const router = express.Router();
const mailRoute = require("./mail.routes");
const { product, shop, cart, addCart, updateCart, deleteCart } = require("../controllers/products.controller");

// 🛍️ Shop Route
router.get("/shop", shop);

// 📦 Product Detail Route
router.get("/product/:id", product);

// 🛒 Cart Route
router.get("/cart", authMiddleware, cart);

// ➕ Add to Cart
router.get("/addtocart/:productid", authMiddleware, addCart);

// ❌ Remove from Cart
router.get("/deleted/:productid", authMiddleware, deleteCart);

// 🔄 Update Cart
router.post("/cart/update/:productid", authMiddleware, updateCart);

// 📧 Enquiry Mail
router.use("/enquiry", mailRoute);

module.exports = router;
