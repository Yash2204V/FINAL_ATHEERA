const express = require("express");
const router = express.Router();

// 🛡️ Middleware imports
const adminAuthMiddleware = require("../middlewares/admin-auth-middleware");
const authMiddleware = require("../middlewares/auth-middleware");

// 🎯 Controller imports
const {
    searchAdminMod,
    createProduct,
    deleteProduct,
    updatePageP,
    editProduct
} = require("../controllers/admin.controller");

// 👤 Model imports
const User = require("../models/user.model");

// 📸 Multer for file uploads
const multer = require("multer");
const { PASSCODE } = require("../config/environment");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

/*  
=========================
 🎩 Admin Routes 
=========================
*/

// 🔍 Get admin panel data
router.get("/", adminAuthMiddleware, searchAdminMod);

// ➕ Create a new product (allows up to 5 images)
router.post("/create", upload.array('images', 5), adminAuthMiddleware, createProduct);



// ❌ Delete a product by ID
router.get("/delete/:productid", adminAuthMiddleware, deleteProduct);

// ✏️ Get edit page for a product
router.get("/edit/:productid", adminAuthMiddleware, updatePageP);

// 🛠️ Edit a product's details
router.post("/edit/:productid", adminAuthMiddleware, editProduct);

/*  
=========================
 👥 User Routes 
=========================
*/

// 🔑 Make a user an admin with a valid passcode
router.get("/makeAdmin", authMiddleware, async (req, res) => {
    try {
        const passcode = req.query.passcode;

        if (passcode === PASSCODE) {
            const user = await User.findOneAndUpdate(
                { _id: req.user._id },
                { role: "admin" },
                { new: true } // Return updated document
            );

            return res.status(200).json({
                success: true,
                message: "🎉 You are now an admin!",
                user
            });
        }

        return res.status(400).json({
            success: false,
            message: "❌ Invalid passcode!"
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "⚠️ Internal Server Error",
            error: error.message
        });
    }
});

// 🚀 Export router
module.exports = router;
