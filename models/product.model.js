const mongoose = require("mongoose");

// Product Schema
const productSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    rating: { type: Number, min: 0, max: 5, default: 0 },
    category: { type: String, enum: ["clothing"], required: true, trim: true },
    subCategory: { type: String, required: true, trim: true },
    subSubCategory: { type: String, required: true, trim: true },
    brand: { type: String, default: "", trim: true },
    images: [{ imageBuffer: Buffer, contentType: String }],
    availability: { type: Boolean, default: true },
    variants: [{
        modelno: { type: String, required: true, trim: true },
        size: { type: String, enum: ["XS", "S", "M", "L", "XL", "None"], required: true, default: "None" },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
        color: { type: String, required: true, default: "" },
        discount: { type: Number, default: 0 }
    }],
    description: { type: String, default: "", trim: true },
    weight: { type: String, default: "", trim: true },
    createdAt: { type: Date, default: Date.now },
});

// Add these to your schema
productSchema.index({ title: 'text', category: 'text', subCategory: 'text' });
productSchema.index({ createdAt: -1 });
productSchema.index({ rating: -1 });
productSchema.index({ 'variants.price': 1 });

// **Middleware for Dynamic Validation of subCategory & subSubCategory**
productSchema.pre("validate", function (next) {
    const validSubCategories = {
        clothing: ["suit", "saree"],
    };
    const validSubSubCategories = {
        suit: ["Formal", "Casual", "Wedding", "Business"],
        saree: ["Silk", "Cotton", "Georgette", "Banarasi", "Chiffon"]
    };

    if (!validSubCategories[this.category]?.includes(this.subCategory)) {

        return next(new Error("Invalid sub-category for the selected category."));
    }
    if (!validSubSubCategories[this.subCategory]?.includes(this.subSubCategory)) {
        return next(new Error("Invalid sub-sub-category for the selected sub-category."));
    }
    next();
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;