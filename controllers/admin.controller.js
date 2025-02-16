const Product = require("../models/product.model");

const searchAdminMod = async (req, res) => {
    const searchQuery = req.query.query || '';
    console.log("AA GYA");

    // Build search criteria
    const searchCriteria = {
        $or: [
            { title: { $regex: searchQuery, $options: 'i' } },
            { category: { $regex: searchQuery, $options: 'i' } },
            { subCategory: { $regex: searchQuery, $options: 'i' } },
            { subSubCategory: { $regex: searchQuery, $options: 'i' } }
        ]
    };
    const products = await Product.find(searchCriteria);
    res.render("admin-dashboard", { products, searchQuery });
}


module.exports = {
    searchAdminMod,
}