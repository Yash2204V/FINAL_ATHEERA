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
    // console.log(totalProducts);

    res.render("admin-dashboard", { products, searchQuery, totalProducts, currentPage: parseInt(page) });
}

const createProduct = async (req, res) => {
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
}

const deleteProduct = async (req, res) => {

    try {
        const product = await Product.findOneAndDelete({ _id: req.params.productid });
        res.redirect("/admin-haha");
    } catch (e) {
        res.status(400).json({
            err: e.message
        });
    }
}

const updatePageP = async (req, res) => {

    try {
        const product = await Product.findOne({ _id: req.params.productid });
        res.render("update-product", { product });
    } catch (e) {
        res.status(400).json({
            err: e.message
        });
    }
}

const editProduct = async (req, res) => {
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
}

module.exports = {
    searchAdminMod,
    createProduct,
    deleteProduct,
    updatePageP,
    editProduct
}