const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

// Create server app
const app = express();
app.use(express.json());
app.use(cookieParser());

// Enable CORS if desired
const origins = process.env.CORS_ORIGINS?.split(';');
if (origins) {
    console.log('Setting CORS to ', origins);
    app.use(cors({
        origin: origins,
        credentials: true
    }));
}

module.exports = app;