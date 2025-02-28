/**
 * Product Model
 * Defines the schema and methods for product data
 */

const mongoose = require("mongoose");

/**
 * Product Schema
 * Defines the structure and validation for product data
 */
const productSchema = new mongoose.Schema({
    // Basic product information
    title: { 
        type: String, 
        required: [true, 'Product title is required'], 
        trim: true,
        maxlength: [100, 'Title cannot exceed 100 characters']
    },
    category: { 
        type: String, 
        enum: {
            values: ["clothing"],
            message: '{VALUE} is not a supported category'
        },
        required: [true, 'Category is required'], 
        trim: true,
        index: true
    },
    subCategory: { 
        type: String, 
        required: [true, 'Sub-category is required'], 
        trim: true,
        index: true
    },
    subSubCategory: { 
        type: String, 
        required: [true, 'Sub-sub-category is required'], 
        trim: true,
        index: true
    },
    brand: { 
        type: String, 
        default: "", 
        trim: true 
    },
    
    // Product images
    images: {
        type: [{ 
            imageBuffer: Buffer, 
            contentType: String 
        }],
        validate: {
            validator: function(val) {
                if (!val || val.length === 0) {
                    throw new Error("At least one image is required");
                }
                if (val.length > 5) {
                    throw new Error("You can upload a maximum of 5 images");
                }
                return true;
            },
            message: props => props.reason
        }    
    },
    
    // Product status
    availability: { 
        type: Boolean, 
        default: true,
        index: true
    },
    featured: {
        type: Boolean,
        default: false,
        index: true
    },
    
    // Product variants
    variants: [{
        _id: { 
            type: mongoose.Schema.Types.ObjectId, 
            auto: true 
        }, 
        modelno: { 
            type: String, 
            required: [true, 'Model number is required'], 
            trim: true 
        },
        size: { 
            type: String, 
            enum: {
                values: ["XS", "S", "M", "L", "XL", "None"],
                message: '{VALUE} is not a supported size'
            },
            required: true, 
            default: "None" 
        },
        discount: { 
            type: Number, 
            default: 0,
            min: [0, 'Discount cannot be negative']
        },
        price: { 
            type: Number, 
            required: [true, 'Price is required'],
            min: [0, 'Price cannot be negative']
        },
        quantity: { 
            type: Number, 
            required: [true, 'Quantity is required'],
            min: [0, 'Quantity cannot be negative']
        },
        tone: { 
            type: String, 
            required: true, 
            default: "" 
        }
    }],
    
    // Product details
    description: { 
        type: String, 
        default: "", 
        trim: true, 
        required: [true, 'Description is required'],
        maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    weight: { 
        type: String, 
        default: "", 
        trim: true 
    },
    
    // Timestamps
    createdAt: { 
        type: Date, 
        default: Date.now,
        index: true
    },
}, {
    timestamps: true
});

// Add indexes for efficient queries
productSchema.index({ title: 'text', category: 'text', subCategory: 'text' });
productSchema.index({ createdAt: -1 });
productSchema.index({ 'variants.price': 1 });

/**
 * Virtual for effective price
 * Returns the lowest price after applying discount
 */
productSchema.virtual('effectivePrice').get(function() {
    if (!this.variants || this.variants.length === 0) return 0;
    
    return this.variants.reduce((minPrice, variant) => {
        const effectivePrice = variant.discount > 0 ? variant.discount : variant.price;
        return effectivePrice < minPrice ? effectivePrice : minPrice;
    }, Infinity);
});

/**
 * Virtual for total stock
 * Returns the sum of quantities across all variants
 */
productSchema.virtual('totalStock').get(function() {
    if (!this.variants || this.variants.length === 0) return 0;
    
    return this.variants.reduce((total, variant) => {
        return total + (variant.quantity || 0);
    }, 0);
});

/**
 * Middleware for Dynamic Validation of subCategory & subSubCategory
 */
productSchema.pre("validate", function(next) {
    const validSubCategories = {
        clothing: ["suit", "saree"],
    };
    
    const validSubSubCategories = {
        suit: ["Formal", "Casual", "Wedding", "Business"],
        saree: ["Silk", "Cotton", "Georgette", "Banarasi", "Chiffon"]
    };
    
    // Validate subCategory
    if (!validSubCategories[this.category]?.includes(this.subCategory)) {
        return next(new Error(`Invalid sub-category '${this.subCategory}' for the selected category '${this.category}'`));
    }
    
    // Validate subSubCategory
    if (!validSubSubCategories[this.subCategory]?.includes(this.subSubCategory)) {
        return next(new Error(`Invalid sub-sub-category '${this.subSubCategory}' for the selected sub-category '${this.subCategory}'`));
    }
    
    next();
});

/**
 * Pre-save middleware to update availability based on stock
 */
productSchema.pre('save', function(next) {
    // Check if any variant has stock
    const hasStock = this.variants.some(variant => variant.quantity > 0);
    
    // Update availability based on stock
    this.availability = hasStock;
    
    next();
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;