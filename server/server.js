const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const session = require("express-session");

// Read .env file
require("dotenv").config();

// Connect to database
const CONNECTION_STRING = process.env.CONNECTION_STRING || 'mongodb://localhost:27017/component-tracker';
mongoose.connect(CONNECTION_STRING)
    .then(console.log("Connected to database successfully."))
    .catch(err => console.log(err.reason));

// Create server app
const app = express();

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

app.use('/', (req, res) => {
    if (req.isAuthenticated()) {
        res.write(`<p>Hello ${req.user?.displayName}  </p>`)
    } else {
        res.write('<p>You are currently logged out</p>')
    }
    res.write('<a href="/auth/login"><button>Login</button></a>');
    res.write('<a href="/auth/logout"><button>Logout</button></a>');
    res.end();
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
