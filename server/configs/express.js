const express = require("express");
const session = require("express-session");
const cors = require("cors");

// Create server app
const app = express();
app.use(express.json());

// Enable CORS if desired
const origins = process.env.CORS_ORIGINS?.split(';');
if (origins) {
    console.log('Setting CORS to ', origins);
    app.use(cors({
        origin: origins,
        credentials: true
    }));
}

// Install session middleware
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true
}));


module.exports = app;