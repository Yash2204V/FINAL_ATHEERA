// 🌟 Import Required Modules
const Product = require("../models/product.model");
const transporter = require("../utils/transporter");
const dbgr = require("debug")("development: mail-controller");

// 🔑 Import Config
const { EMAIL } = require("../config/environment");

// 📌 ================== MAIL CONTROLLERS ================== 📌

/**
 * ✉️ Single Product Enquiry Mail
 */
const singleProductMail = async (req, res) => {
    try {
        const { productid } = req.params;
        const user = req.user;

        // 🔍 Validate Inputs
        if (!productid) return res.status(400).json({ message: "Product ID is required" });
        if (!user) return res.status(401).json({ message: "User authentication required" });

        // 🛍 Fetch Product Details
        const product = await Product.findById(productid);
        if (!product) return res.status(404).json({ message: "Product not found" });

        // 📩 Send Enquiry Mail
        await transporter.sendMail({
            from: `ATHEERA 👗🥻 ${EMAIL}`,
            to: user.email,
            subject: "Single Product Enquiry",
            html: `
            <h1>Product Enquiry</h1>
            <h2>User Details</h2>
            <table>
                <tr><td><strong>Name:</strong></td><td>${user.name}</td></tr>
                <tr><td><strong>Email:</strong></td><td>${user.email}</td></tr>
                <tr><td><strong>Phone No:</strong></td><td>${req.query.query || "N/A"}</td></tr>
            </table>
            <h2>Product Details</h2>
            <table>
                <tr><td><strong>ID:</strong></td><td>${product._id}</td></tr>
                <tr><td><strong>Model:</strong></td><td>${product.variants?.[0]?.modelno || "N/A"}</td></tr>
                <tr><td><strong>Category:</strong></td><td>${product.category}</td></tr>
                <tr><td><strong>Sub Category:</strong></td><td>${product.subCategory}</td></tr>
                <tr><td><strong>Sub Sub Category:</strong></td><td>${product.subSubCategory}</td></tr>
                <tr><td><strong>Price:</strong></td><td>₹${product.variants?.[0]?.price || "N/A"}</td></tr>
            </table>
            `,
        });

        dbgr("✅ Single Product Enquiry Sent!");
        res.redirect(`/products/product/${productid}`);
    } catch (err) {
        dbgr("❌ Error in Single Product Enquiry:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

/**
 * ✉️ Multiple Products Enquiry Mail
 */
const multipleProductMail = async (req, res) => {
    try {
        const user = req.user;

        // 🔍 Validate User & Cart
        if (!user) return res.status(401).json({ message: "User authentication required" });
        if (!user?.cart?.length) return res.redirect("/products/cart");

        // 🛍 Fetch Products Details
        const products = await Promise.all(
            user.cart.map(async (cartItem) => {
                const product = await Product.findById(cartItem.product._id);
                if (!product) return null;

                const variant = product.variants.find(v => v.size === cartItem.size) || product.variants[0];

                return {
                    id: product._id,
                    quantity: cartItem.quantity,
                    size: cartItem.size,
                    model: variant?.modelno || "N/A",
                    category: product.category,
                    subCategory: product.subCategory,
                    subSubCategory: product.subSubCategory,
                    price: variant?.price || "N/A",
                };
            })
        );

        const validProducts = products.filter(p => p !== null); // Remove null entries

        // 📩 Send Enquiry Mail
        await transporter.sendMail({
            from: `ATHEERA 👗🥻 ${EMAIL}`,
            to: user.email,
            subject: "Multiple Products Enquiry",
            html: `
            <h1>Products Enquiry</h1>
            <h2>User Details</h2>
            <table>
                <tr><td><strong>Name:</strong></td><td>${user.name}</td></tr>
                <tr><td><strong>Email:</strong></td><td>${user.email}</td></tr>
                <tr><td><strong>Phone No:</strong></td><td>${req.query.query || "N/A"}</td></tr>
            </table>
            <h2>Product Details</h2>
            <table>
                ${validProducts.map(
                    (p) => `
                <tr><td><strong>ID:</strong></td><td>${p.id}</td></tr>
                <tr><td><strong>Model:</strong></td><td>${p.model}</td></tr>
                <tr><td><strong>Category:</strong></td><td>${p.category}</td></tr>
                <tr><td><strong>Sub Category:</strong></td><td>${p.subCategory}</td></tr>
                <tr><td><strong>Sub Sub Category:</strong></td><td>${p.subSubCategory}</td></tr>
                <tr><td><strong>Price:</strong></td><td>₹${p.price}</td></tr>
                <tr><td><strong>Quantity:</strong></td><td>${p.quantity}</td></tr>
                <tr><td><strong>Size:</strong></td><td>${p.size}</td></tr>
                <tr><td colspan="2"><hr></td></tr>
                `
                ).join("")}
            </table>
            `,
        });

        dbgr("✅ Multiple Products Enquiry Sent!");
        res.redirect("/products/cart");
    } catch (err) {
        dbgr("❌ Error in Multiple Products Enquiry:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

// 🚀 Export Controllers
module.exports = {
    singleProductMail,
    multipleProductMail,
};
