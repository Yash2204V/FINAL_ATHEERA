const mongoose = require("mongoose");
const generateToken = require("../utils/generateToken");

// User Schema
const userSchema = new mongoose.Schema({
    googleId: { type: String, unique: true },
    email: { type: String, unique: true, required: true },
    name: { type: String, required: true },
    tokens: [{ token: { type: String, required: true } }],
    cart: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        quantity: { type: Number, default: 1, required: true },
        size: { type: String, required: true }
    }],
    role: { type: String, enum: ["user", "admin"], default: "user" },
}, { timestamps: true });

// JWT Token Generation
userSchema.methods.generateAuthToken = async function () {
    const token = generateToken(this._id);
    this.tokens.push({ token });
    await this.save();
    return token;
};

const User = mongoose.model('User', userSchema);

module.exports = User;