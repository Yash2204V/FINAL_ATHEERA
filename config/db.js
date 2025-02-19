const mongoose = require("mongoose");
const { MONGO_URI } = require("./environment");
const dbgr = require("debug")("development: mongoose");

/* 
To use the debugger in the development environment, 
add below lines in your .env & ONLY IN DEVELOPMENT PHASE.

NODE_ENV=development
DEBUG=development:* 

Use the MONGO_URI as the environment variable for mongodb connection string.
*/

const connectionDB = async () => {
    try {
        const conn = await mongoose.connect(MONGO_URI);
        dbgr(`✅ MongoDB connected: ${conn.connection.host}`);
    } catch (e) {
        dbgr(`❌ MongoDB connection error: ${e.message}`);
        process.exit(1);
    }
}

module.exports = connectionDB;