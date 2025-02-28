const Product = require("../models/product.model");
const Category = require("../sample/categories");
const dbgr = require("debug")("development: products-controller");

const shop = async (req, res) => {
    try {
        const { query = '', sortBy = 'createdAt', sortOrder = 'desc', page = 1 } = req.query;
        const DEFAULT_LIMIT = 27;
        // Sorting order
        const order = sortOrder === 'desc' ? -1 : 1;

        // Search criteria
        const searchCriteria = {
            $or: [
                { title: { $regex: query, $options: 'i' } },
                { category: { $regex: query, $options: 'i' } },
                { subCategory: { $regex: query, $options: 'i' } },
                { subSubCategory: { $regex: query, $options: 'i' } }
            ]
        };

        // Use aggregation for better query performance
        const aggregationPipeline = [
            { $match: searchCriteria },
            { $sort: { [sortBy]: order } },
            { $limit: DEFAULT_LIMIT },
            { $count: 'total' } // This stage counts all documents before limit and skip
        ];

        const totalProducts = await Product.find(searchCriteria).countDocuments();

        const [ products ] = await Promise.all([
            Product.find(searchCriteria).sort({ [sortBy]: order }).limit(DEFAULT_LIMIT * page),
            Product.aggregate(aggregationPipeline)
        ]);

        res.render("shop", {
            Category,
            products,
            currentPage: parseInt(page),
            searchQuery: query,
            totalProducts,
            sortBy,
            sortOrder
        });
    } catch (error) {
        console.error("🛑 Shop Error:", error);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
};

const product = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ error: "System Halt" });

        res.render("product", { product });
    } catch (error) {
        dbgr("🛑 Product Fetch Error:", error);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
};

const cart = async (req, res) => {
    try {
        // console.log("USER", user);
        // console.log("--------------------------------------------------------------------------------");

        const user = req.user;
        await user.populate("cart.product");
        user.cart = user.cart.filter(item => item.product !== null);
        // console.log("Filtered Cart:", user.cart);

        let totalPrice = 0;
        for (const item of user.cart) {
            const product = await Product.findById(item.product);
            if (product) {
                const variant = product.variants.find(p => p.size === item.size);
                const price = variant ? (variant.discount ? variant.discount : variant.price) : 1;
                // console.log("price", price);
                
                totalPrice += price * item.quantity;
            }
        }
        // console.log("TotalPrice", totalPrice);        

        res.render("cart", { user: user || "" });
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
        const product = await Product.findById( productid );
        const { category, subCategory, subSubCategory, variants,  } = product;

        if (!user) return res.status(404).json({ error: "User not found" });

        const cartItem = user.cart.find(item => item.product.toString() === productid && item.size === size);
        if (cartItem) {
            cartItem.quantity += parseInt(quantity);
        }
         else {
            user.cart.push({ product: productid, quantity: parseInt(quantity), size: variants[0].size, variantId: variants[0]._id });
        }

        await user.save();

        return direct ? res.redirect(`/products/shop?query=${subSubCategory ? subSubCategory : (subCategory ? subCategory : category)}`) : res.redirect(`/products/product/${productid}`);
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

        const cartItemIndex = user.cart.reverse().findIndex(item => item.product.toString() === productid);
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

        const product = await Product.findById(productid);
        console.log(product.variants[0].quantity)

        // console.log("Product",product);
        // console.log("Quantity", quantity);
        // console.log("Size", size);


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