/**
 * Main Application Entry Point
 * Sets up Express server with middleware and routes
 */

// Load Environment Variables
require("dotenv").config();

// Import Required Modules
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const dbgr = require("debug")("development: app");
const MongoStore = require("connect-mongo");
const helmet = require("helmet");
const compression = require("compression");

// Import Configuration & Environment Variables
const connectionDB = require("./config/db");
const { 
  NODE_ENV, 
  EXPRESS_SESSION_SECRET, 
  BASE_URL, 
  PORT,
  MONGO_URI 
} = require("./config/environment");

// Connect to Database
connectionDB();

// Initialize Express App
const app = express();

// Security Headers Middleware
if (NODE_ENV === 'production') {
    app.use(helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],

                // ✅ Allow external scripts (No inline scripts)
                scriptSrc: ["'self'", "https://cdnjs.cloudflare.com", "https://cdn.jsdelivr.net"], 

                // ✅ Allow Tailwind & external styles (inline styles needed for Tailwind)
                styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com", "https://cdn.jsdelivr.net", "https://fonts.googleapis.com"],

                // ✅ Allow images from self, data URIs, and external icon sources
                imgSrc: ["'self'", "data:", "https://img.icons8.com"],

                // ✅ Allow fonts from Google Fonts and CDNs
                fontSrc: ["'self'", "https://cdnjs.cloudflare.com", "https://fonts.gstatic.com"],

                // ✅ Other security settings
                objectSrc: ["'none'"], // Prevents loading objects like Flash, etc.
                upgradeInsecureRequests: [],
            }
        },
        frameguard: { action: 'sameorigin' }
    }));
} else {
    // In development, disable CSP for easy debugging
    app.use(helmet({
        contentSecurityPolicy: false
    }));
}

// Compression Middleware
app.use(compression());

// Request Parsing Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Session Configuration
app.use(session({
  secret: EXPRESS_SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: MONGO_URI,
    ttl: 24 * 60 * 60, // Session expiration time in seconds (24 hours)
    autoRemove: 'native', // Use MongoDB's TTL index
    touchAfter: 24 * 3600 // Only update session once per day unless data changes
  }),
  cookie: {
    httpOnly: true,
    secure: NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'lax'
  }
}));

// Static Files & View Engine
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Request Logging in Development
if (NODE_ENV !== 'production') {
  const morgan = require('morgan');
  app.use(morgan('dev'));
}

// Authentication Middleware
const loggedIn = require("./middlewares/check-user-logged-in");
app.use(loggedIn);

// Define Routes
const userRoute = require("./routes/user.routes");
const productsRoute = require("./routes/products.routes");
const adminRoute = require("./routes/admin.routes");
const accountRoute = require("./routes/account.routes");

// Home Route
app.get("/", (req, res) => {
  res.render("index");
});

// Mount Route Handlers
app.use("/user", userRoute);
app.use("/products", productsRoute);
app.use("/account", accountRoute);
app.use("/admin-haha", adminRoute);

// 404 Handler
app.use((req, res, next) => {
  res.status(404).render('error', {
    message: 'Page Not Found',
    error: { status: 404 }
  });
});

// Global Error Handling
const errorHandler = require("./middlewares/error-handler");
app.use(errorHandler);

// Start Server
app.listen(PORT, () => {
  dbgr(`✅ Server running on ${BASE_URL}`);
  
  if (NODE_ENV === 'production') {
    console.log(`Server running in production mode`);
  } else {
    console.log(`Server running in ${NODE_ENV} mode at ${BASE_URL}`);
  }
});

// Handle Uncaught Exceptions
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(err.name, err.message, err.stack);
  process.exit(1);
});

// Handle Unhandled Promise Rejections
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err.name, err.message, err.stack);
  process.exit(1);
});