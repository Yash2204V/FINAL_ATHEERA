// 🌟 Import Required Modules
const { OAuth2Client } = require("google-auth-library");
const dbgr = require("debug")("development: user-controller");

// 🔑 Import Config & Models
const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALLBACK_URL } = require("../config/environment");
const User = require("../models/user.model");

// 🔐 Initialize OAuth2 Client
const oAuth2Client = new OAuth2Client(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_CALLBACK_URL
);

// 📌 ================== AUTH CONTROLLERS ================== 📌

/**
 * 🔗 Google Authentication - Initiates the Login Flow
 */
const authGoogle = (req, res) => {
    if (req.cookies.token) {
        return res.redirect("/");
    }
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: ['profile', 'email'],
        prompt: 'consent'
    });
    res.redirect(authUrl);
};

/**
 * 🔄 Google OAuth Callback - Handles Authentication Response
 */
const authGoogleCallback = async (req, res) => {
    try {
        const { code } = req.query;

        // 🎟 Exchange Authorization Code for Tokens
        const { tokens } = await oAuth2Client.getToken(code);
        oAuth2Client.setCredentials(tokens);

        // 📝 Fetch User Profile Data
        const { data } = await oAuth2Client.request({
            url: 'https://people.googleapis.com/v1/people/me?personFields=names,emailAddresses'
        });

        // 🔍 Check if User Exists, If Not, Create New User
        let user = await User.findOne({ email: data.emailAddresses[0].value });
        if (!user) {
            user = new User({
                googleId: data.resourceName.split('/')[1],
                name: data.names[0].displayName,
                email: data.emailAddresses[0].value
            });
            await user.save();
        }

        // 🔑 Generate Authentication Token
        const token = await user.generateAuthToken();

        // 🍪 Set JWT Token in Cookie
        res
        .cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 3600000, // 1 hour
            sameSite: 'lax'
        })
        if(user.role === "admin"){
            return res.redirect('/admin-haha');
        }
        res.redirect('/');
    } catch (err) {
        dbgr('❌ Auth error:', err);
        res.redirect('/login?error=auth_failed');
    }
};


/**
 * 🧐 Login Page - Conditional Rendering
 */
const loginPage = (req, res) => {
    if (req.cookies.token) {
        return res.render("account");
    }
    res.render("login");
}

/**
 * 🚪 Logout Controller - Clears Authentication Token
 */
const logout = async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter(token => token.token !== req.token);
        await req.user.save();

        res.clearCookie('token');
        res.redirect('/');
    } catch (error) {
        dbgr("❌ Logout failed:", error);
        res.status(500).redirect('/login?error=logout_failed');
    }
};

// 🚀 Export Controllers
module.exports = {
    authGoogle,
    authGoogleCallback,
    logout,
    loginPage
};