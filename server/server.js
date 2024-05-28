// Read .env file before any other module
require("dotenv").config();
const path = require('path');

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

// API Routes
const rideRoutes = require('./routes/ride.routes');
const stravaRoutes = require('./routes/strava.routes');
const rwgpsRoutes = require('./routes/rwgps.routes');
const compRoutes = require('./routes/component.routes');
app.use('/', [rideRoutes, stravaRoutes, rwgpsRoutes, compRoutes]);

// Setup Swagger API documentation end point
const swaggerUi = require("swagger-ui-express");
const swaggerSpecs = require("./configs/swagger");
app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// Serve the Angular app from our 'public' folder
const express = require('express');
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
