// 1️⃣ Load Environment Variables  
require("dotenv").config();  

// 2️⃣ Import Required Modules  
const express = require("express");  
const path = require("path");  
const cookieParser = require("cookie-parser");  
const session = require("express-session");  
const dbgr = require("debug")("development: port");
const MongoStore = require("connect-mongo");

// 3️⃣ Import Configuration & Environment Variables  
const connectionDB = require("./config/db");  
const { NODE_ENV, EXPRESS_SESSION_SECRET, BASE_URL,MONGO_URI } = require("./config/environment");  

// 4️⃣ Connect to Database  
connectionDB();  

// 5️⃣ Initialize Express App  
const app = express();  
const PORT = process.env.PORT || 3000;  

// 6️⃣ Middleware Setup  
app.use(express.json());  
app.use(express.urlencoded({ extended: true }));  
app.use(cookieParser());  

// 7️⃣ Session Configuration  
app.use(session({
	secret: EXPRESS_SESSION_SECRET,
	resave: false,
	saveUninitialized: false,
	store: MongoStore.create({
		mongoUrl: MONGO_URI, // Replace with your MongoDB connection string
		ttl: 24 * 60 * 60, // Session expiration time in seconds (24 hours)
	}),
	cookie: {
		httpOnly: true,
		secure: NODE_ENV === 'production', // Secure in production
		maxAge: 24 * 60 * 60 * 1000 // 24 hours
	}
}));

// 8️⃣ Static Files & View Engine  
app.use(express.static(path.join(__dirname, "public")));  
app.set("view engine", "ejs");  

// 9️⃣ Authentication Middleware  
const loggedIn = require("./middlewares/check-user-logged-in");  
app.use(loggedIn);  

// 🔟 Define Routes  
const userRoute = require("./routes/user.routes");  
const productsRoute = require("./routes/products.routes");  
const adminRoute = require("./routes/admin.routes");  
const accountRoute = require("./routes/account.routes");  

app.get("/", (req, res) => {  
	res.render("index");  
});  

app.use("/user", userRoute);  
app.use("/products", productsRoute);  
app.use("/account", accountRoute);  
app.use("/admin-haha", adminRoute);  

// 1️⃣1️⃣ Global Error Handling    
const errorHandler = require("./middlewares/error-handler");
app.use(errorHandler);  

// 1️⃣2️⃣ Start Server  
app.listen(PORT, () => {  
	dbgr(`Server running on ${BASE_URL}`);  
});