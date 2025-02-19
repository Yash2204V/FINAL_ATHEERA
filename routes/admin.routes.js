const express = require("express");
const router = express.Router();
const adminAuthMiddleware = require("../middlewares/admin-auth-middleware");
const authMiddleware = require("../middlewares/auth-middleware");

const { searchAdminMod } = require("../controllers/admin.controller");
const User = require("../models/user.model");
const Product = require("../models/product.model");

const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.get("/", adminAuthMiddleware, searchAdminMod);

router.post("/create", upload.array('images', 5), adminAuthMiddleware, async (req, res) => {
    // console.log(req.body);
    
    try {
        const product = await Product.create(req.body);
        const imageDocs = req.files.map(file => ({
            imageBuffer: file.buffer,  // Store as buffer
            contentType: file.mimetype, // Store MIME type
        }));
        await Product.findOneAndUpdate({ _id: product._id }, { images: imageDocs })
        await product.save();
        res.status(200).redirect("/admin-haha/");
    } catch (e) {
        res.status(400).json({
            err: e.message
        });
    }
});

router.get("/delete/:productid", adminAuthMiddleware, async (req, res) => {

    try {
        const product = await Product.findOneAndDelete({ _id: req.params.productid });
        res.redirect("/admin-haha");
    } catch (e) {
        res.status(400).json({
            err: e.message
        });
    }
});

router.get("/edit/:productid", adminAuthMiddleware, async (req, res) => {
    // console.log(req.params.productid);

    try {
        const product = await Product.findOne({ _id: req.params.productid });
        res.render("update-product", { product });
    } catch (e) {
        res.status(400).json({
            err: e.message
        });
    }
});

router.post("/edit/:productid", adminAuthMiddleware, async (req, res) => {
    // console.log(req.params.productid);
    const { title, rating, category, subCategory, subSubCategory, brand, availability, variants, description, weight } = req.body;

    try {
        const product = await Product.findOneAndUpdate({ _id: req.params.productid }, { title, rating, category, subCategory, subSubCategory, brand, images, availability, variants, description, weight });
        await product.save();
        res.redirect("/admin-haha");
    } catch (e) {
        res.status(400).json({
            err: e.message
        });
    }
});


router.get("/makeAdmin", authMiddleware, async (req, res) => {
    const user = await User.findOneAndUpdate({ _id: req.user._id }, { role: "admin" });
    res.status(200).json({
        message: "Ban Gya londeeeeeeeee",
        user
    })
    res.status(400).json({
        message: "Nope",
    })
})

module.exports = router;