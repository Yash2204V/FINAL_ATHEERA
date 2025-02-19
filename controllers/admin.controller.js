const Product = require("../models/product.model");

const searchAdminMod = async (req, res) => {
    const searchQuery = req.query.query || '';
    const page = parseInt(req.query.page) || 1;
    const DEFAULT_LIMIT = 25;


    // Build search criteria
    const searchCriteria = {
        $or: [
            { title: { $regex: searchQuery, $options: 'i' } },
            { category: { $regex: searchQuery, $options: 'i' } },
            { subCategory: { $regex: searchQuery, $options: 'i' } },
            { subSubCategory: { $regex: searchQuery, $options: 'i' } }
        ]
    };

    // Use aggregation for better query performance
    const aggregationPipeline = [
        { $match: searchCriteria },
        { $limit: DEFAULT_LIMIT },
        { $count: 'total' } // This stage counts all documents before limit and skip
    ];

    const [products] = await Promise.all([
        Product.find(searchCriteria).limit(DEFAULT_LIMIT * page),
        Product.aggregate(aggregationPipeline)
    ]);

    const totalProducts = await Product.find(searchCriteria).countDocuments();
    console.log(totalProducts);

    res.render("admin-dashboard", { products, searchQuery, totalProducts, currentPage: parseInt(page) });
}


module.exports = {
    searchAdminMod,
}