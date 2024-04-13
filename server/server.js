const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const session = require("express-session");
const cors = require("cors")

// Read .env file
require("dotenv").config();

// Connect to database
const CONNECTION_STRING = process.env.CONNECTION_STRING || 
                        'mongodb://localhost:27017/component-tracker';
mongoose.connect(CONNECTION_STRING)
    .then(console.log("Connected to database successfully."))
    .catch(err => console.log(err.reason));

// Create server app
const app = express();
app.use(express.json());

// Enable CORS
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

// Initialize passport authentication
require('./passport');
app.use(passport.initialize()); 
app.use(passport.session()); 

const authRoutes = require('./routes/auth.routes');
app.use('/auth', authRoutes);

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
