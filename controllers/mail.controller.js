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
            to: `${EMAIL}`,
            subject: "Single Product Enquiry",
            html: `
                    <h1>Product Enquiry</h1>

                    <h2>User Details</h2>
                    <table style="width: 100%; border-collapse: collapse; border: 1px solid black;">
                        <tr>
                            <td style="border: 1px solid black; padding: 8px;"><strong>Name:</strong></td>
                            <td style="border: 1px solid black; padding: 8px;">${user.name}</td>
                        </tr>
                        <tr>
                            <td style="border: 1px solid black; padding: 8px;"><strong>Email:</strong></td>
                            <td style="border: 1px solid black; padding: 8px;">${user.email}</td>
                        </tr>
                        <tr>
                            <td style="border: 1px solid black; padding: 8px;"><strong>Phone No:</strong></td>
                            <td style="border: 1px solid black; padding: 8px;">${req.query.query || "N/A"}</td>
                        </tr>
                    </table>

                    <h2>Product Details</h2>
                    <table style="width: 100%; border-collapse: collapse; border: 1px solid black;">
                        <tr>
                            <td style="border: 1px solid black; padding: 8px;"><strong>ID:</strong></td>
                            <td style="border: 1px solid black; padding: 8px;">${product._id}</td>
                        </tr>
                        <tr>
                            <td style="border: 1px solid black; padding: 8px;"><strong>Model:</strong></td>
                            <td style="border: 1px solid black; padding: 8px;">${product.variants?.[0]?.modelno || "N/A"}</td>
                        </tr>
                        <tr>
                            <td style="border: 1px solid black; padding: 8px;"><strong>Category:</strong></td>
                            <td style="border: 1px solid black; padding: 8px;">${product.category}</td>
                        </tr>
                        <tr>
                            <td style="border: 1px solid black; padding: 8px;"><strong>Sub Category:</strong></td>
                            <td style="border: 1px solid black; padding: 8px;">${product.subCategory}</td>
                        </tr>
                        <tr>
                            <td style="border: 1px solid black; padding: 8px;"><strong>Sub Sub Category:</strong></td>
                            <td style="border: 1px solid black; padding: 8px;">${product.subSubCategory}</td>
                        </tr>
                        <tr>
                            <td style="border: 1px solid black; padding: 8px;"><strong>Price:</strong></td>
                            <td style="border: 1px solid black; padding: 8px;">₹${product.variants?.[0]?.price || "N/A"}</td>
                        </tr>
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
                    discount: variant?.discount || "N/A"
                };
            })
        );

        const validProducts = products.filter(p => p !== null); // Remove null entries

        // 📩 Send Enquiry Mail
        await transporter.sendMail({
            from: `ATHEERA 👗🥻 ${EMAIL}`,
            to: `${EMAIL}`,
            subject: "Multiple Products Enquiry",
            html: `
                    <h1>Products Enquiry</h1>

                    <h2>User Details</h2>
                    <table style="width: 100%; border-collapse: collapse; border: 1px solid black;">
                        <tr>
                            <td style="border: 1px solid black; padding: 8px;"><strong>Name:</strong></td>
                            <td style="border: 1px solid black; padding: 8px;">${user.name}</td>
                        </tr>
                        <tr>
                            <td style="border: 1px solid black; padding: 8px;"><strong>Email:</strong></td>
                            <td style="border: 1px solid black; padding: 8px;">${user.email}</td>
                        </tr>
                        <tr>
                            <td style="border: 1px solid black; padding: 8px;"><strong>Phone No:</strong></td>
                            <td style="border: 1px solid black; padding: 8px;">${req.query.query || "N/A"}</td>
                        </tr>
                    </table>

                    <h2>Product Details</h2>
                    <table style="width: 100%; border-collapse: collapse; border: 1px solid black;">
                        <thead>
                            <tr>
                                <th style="border: 1px solid black; padding: 8px;">ID</th>
                                <th style="border: 1px solid black; padding: 8px;">Model</th>
                                <th style="border: 1px solid black; padding: 8px;">Category</th>
                                <th style="border: 1px solid black; padding: 8px;">Sub Category</th>
                                <th style="border: 1px solid black; padding: 8px;">Sub Sub Category</th>
                                <th style="border: 1px solid black; padding: 8px;">Price</th>
                                <th style="border: 1px solid black; padding: 8px;">Quantity</th>
                                <th style="border: 1px solid black; padding: 8px;">Size</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${validProducts
                            .map(
                                (p) => `
                                <tr>
                                    <td style="border: 1px solid black; padding: 8px;">${p.id}</td>
                                    <td style="border: 1px solid black; padding: 8px;">${p.model}</td>
                                    <td style="border: 1px solid black; padding: 8px;">${p.category}</td>
                                    <td style="border: 1px solid black; padding: 8px;">${p.subCategory}</td>
                                    <td style="border: 1px solid black; padding: 8px;">${p.subSubCategory}</td>
                                    <td style="border: 1px solid black; padding: 8px;">₹${p.price}</td>
                                    <td style="border: 1px solid black; padding: 8px;">${p.quantity}</td>
                                    <td style="border: 1px solid black; padding: 8px;">${p.size}</td>
                                </tr>
                                `
                            )
                            .join("")}
                        </tbody>
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
