const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    category: { type: String, enum: ["clothing"], required: true, trim: true },
    subCategory: { type: String, required: true, trim: true },
    subSubCategory: { type: String, required: true, trim: true },
    brand: { type: String, default: "", trim: true },
    images: {
        type: [{ imageBuffer: Buffer, contentType: String }],
        validate: {
            validator: function (val) {
                if (val.length > 5) {
                    throw new Error("You can upload a maximum of 5 images.");
                }
                return true;
            },
            message: "You can upload a maximum of 5 images."
        }    
    },
    availability: { type: Boolean, default: true },
    variants: [{
        _id: { type: mongoose.Schema.Types.ObjectId, auto: true }, 
        modelno: { type: String, required: true, trim: true },
        size: { type: String, enum: ["XS", "S", "M", "L", "XL", "None"], required: true, default: "None" },
        discount: { type: Number, default: 0 },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
        tone: { type: String, required: true, default: "" }
    }],
    description: { type: String, default: "", trim: true, required: true },
    weight: { type: String, default: "", trim: true },
    createdAt: { type: Date, default: Date.now },
}, {
    timestamps: true
});

// Add these to your schema
productSchema.index({ title: 'text', category: 'text', subCategory: 'text' });
productSchema.index({ createdAt: -1 });
productSchema.index({ 'variants.price': 1 });

// Middleware for Dynamic Validation of subCategory & subSubCategory
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