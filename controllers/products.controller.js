const Product = require("../models/product.model");
const Category = require("../sample/categories");
const dbgr = require("debug")("development: products-controller");

const shop = async (req, res) => {
    try {
        const { category = '', query = '', page = 1, limit = 5, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
        // console.log("Category:", category);
        // console.log("Query:", query);
        // console.log("Page:", page);
        // console.log("Limit:", limit);
        // console.log("SortBy:", sortBy);
        // console.log("SortOrder:", sortOrder);
        
        // Pagination & Sorting
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const order = sortOrder === 'desc' ? -1 : 1;
        console.log("skip:", skip);
        console.log("order:", order);

        // Search Criteria
        const searchCriteria = {
            $or: [
                { title: { $regex: query, $options: 'i' } },
                { category: { $regex: query, $options: 'i' } },
                { subCategory: { $regex: query, $options: 'i' } },
                { subSubCategory: { $regex: query, $options: 'i' } }
            ]
        };

        const totalProducts = await Product.countDocuments(searchCriteria);
        const totalPages = Math.ceil(totalProducts / limit);

        // Fetch Products
        const products = await Product.find(searchCriteria)
            .sort({ [sortBy]: order })
            .skip(skip)
            .limit(parseInt(limit));

        res.render("shop", {
            onlyCategory: category,
            Category,
            products,
            currentPage: parseInt(page),
            totalPages,
            limit: parseInt(limit),
            searchQuery: query,
            sortBy,
            sortOrder
        });
    } catch (error) {
        dbgr("🛑 Shop Error:", error);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
};

const product = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ error: "Product not found" });

        res.render("product", { product });
    } catch (error) {
        dbgr("🛑 Product Fetch Error:", error);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
};

const cart = async (req, res) => {
    try {
        const user = req.user;
        // console.log("USER", user);
        // console.log("--------------------------------------------------------------------------------");
        await user.populate("cart.product");
        // console.log("USER", user);
    
        let totalPrice = 0;
        for (const item of user.cart) {
          const product = await Product.findById(item.product);
          if (product) {
          const price = product.variants.find(p => p.size === item.size)?.price || 1;
          totalPrice += price * item.quantity;
          }
        }
        // console.log("TotalPrice", totalPrice);
        
        res.render("cart", { user: user || "", totalPrice });
    } catch (error) {
        dbgr("🛑 Cart Error:", error);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
};

const addCart = async (req, res) => {
    try {
        const { productid } = req.params;
        const { quantity = 1, size = "None", direct } = req.query;
        const user = req.user;

        if (!user) return res.status(404).json({ error: "User not found" });

        const cartItem = user.cart.find(item => item.product.toString() === productid && item.size === size);
        if (cartItem) {
            cartItem.quantity += parseInt(quantity);
        } else {
            user.cart.push({ product: productid, quantity: parseInt(quantity), size });
        }

        await user.save();

        return direct ? res.redirect("/products/shop") : res.redirect(`/products/product/${productid}`);
    } catch (error) {
        dbgr("🛑 Add to Cart Error:", error);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
};

const deleteCart = async (req, res) => {
    try {
        const user = req.user;
        const { productid } = req.params;

        if (!user) return res.status(404).json({ error: "User not found" });

        const cartItemIndex = user.cart.findIndex(item => item.product.toString() === productid);
        if (cartItemIndex === -1) return res.status(404).json({ error: "Product not found in cart" });

        user.cart.splice(cartItemIndex, 1);
        await user.save();

        res.redirect("/products/cart");
    } catch (error) {
        dbgr("🛑 Delete from Cart Error:", error);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
};

const updateCart = async (req, res) => {
    try {
        const { productid } = req.params;
        const { quantity = 1, size = "None" } = req.body;
        const user = req.user;

        if (!user) return res.status(404).json({ error: "User not found" });

        const cartItem = user.cart.find(item => item.product.toString() === productid);
        if (!cartItem) return res.status(404).json({ error: "Product not found in cart" });

        if (parseInt(quantity) <= 0) {
            return res.status(400).json({ error: "Quantity must be at least 1" });
        }

        cartItem.quantity = parseInt(quantity);
        cartItem.size = size;

        await user.save();
        res.redirect("/products/cart");
    } catch (error) {
        dbgr("🛑 Update Cart Error:", error);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
};

module.exports = {
    shop,
    product,
    cart,
    addCart,
    deleteCart,
    updateCart
};