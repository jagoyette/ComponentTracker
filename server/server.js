// Read .env file before any other module
require("dotenv").config();

// Configure database
const mongoose = require("./configs/mongoose");

// Configure Express app
const app = require("./configs/express");

// Initialize passport authentication
const passport = require('./configs/passport');
app.use(passport.initialize()); 

// Setup routes
const authRoutes = require('./routes/auth.routes');
app.use('/auth', authRoutes);

const rideRoutes = require('./routes/ride.routes');
app.use('/ride', rideRoutes);

const stravaRoutes = require('./routes/strava.routes');
app.use('/strava', stravaRoutes);

const rwgpsRoutes = require('./routes/rwgps.routes');
app.use('/rwgps', rwgpsRoutes);

const compRoutes = require('./routes/component.routes');
app.use('/component', compRoutes);

// Serve the Angular app from our 'public' folder
const express = require('express');
const path = require('path');
const publicPath = path.join(__dirname, 'public')
app.use(express.static(publicPath))
app.use('/*', express.static(publicPath))

// Run the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

// start a job that refreshes strava tokens
const TokenController = require('./controllers/stravaToken');
const cron = require("node-cron");
cron.schedule('0 0 1 * * *', () => {
    console.log('Strava Token Refresh Checker starting at ' + new Date());
    TokenController.refreshExpiringUserTokens();
}, {
    // Start executing job immediately
    runOnInit: true
});
