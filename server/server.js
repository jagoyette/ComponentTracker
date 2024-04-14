// Read .env file before any other module
require("dotenv").config();

// Configure database
const mongoose = require("./configs/mongoose");

// Configure Express app
const app = require("./configs/express");

// Initialize passport authentication
const passport = require('./configs/passport');
app.use(passport.initialize()); 
app.use(passport.session()); 

// Setup routes
const authRoutes = require('./routes/auth.routes');
app.use('/auth', authRoutes);

// Run the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
