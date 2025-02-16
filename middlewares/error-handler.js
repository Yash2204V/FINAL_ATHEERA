const errorHandler = (err, req, res, next) => {
    let statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
    let message = err.message || "🚨 Oops! Something went wrong on the server.";

    // 🔍 Handling Specific Errors
    if (err.name === "ValidationError") {
        message = Object.values(err.errors).map((val) => val.message).join(", ");
        statusCode = 400; // 🛑 Bad Request
    } else if (err.name === "CastError") {
        message = `❌ Resource not found with ID: ${err.value}`;
        statusCode = 404; // 🔍 Not Found
    } else if (err.code === 11000) {
        message = `⚠️ Duplicate field value entered!`;
        statusCode = 400; // ❌ Bad Request
    }

    // 🖥️ Log error details (Only in development mode)
    if (process.env.NODE_ENV !== "production") {
        console.error(`❌ Error: ${message}`);
        console.error(`🔍 Stack Trace: ${err.stack}`);
    }

    // 📡 Send response
    res.status(statusCode).json({
        success: false,
        message,
        stack: process.env.NODE_ENV === "production" ? "🔒 Stack trace hidden" : err.stack,
    });
};

module.exports = errorHandler;
