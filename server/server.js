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

const stravaRoutes = require('./routes/strava.routes');
app.use('/strava', stravaRoutes);

// Run the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

// start a job that refreshes strava tokens
const TokenController = require('./controllers/stravaToken');
const cron = require("node-cron");
cron.schedule('* * 1 * * *', () => {
    console.log('Strava Token Refresh Checker starting at ' + new Date());
    TokenController.refreshExpiringUserTokens();
});
