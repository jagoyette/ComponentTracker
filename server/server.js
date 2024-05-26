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

const path = require('path');
//////////////////////////////////////////////////////////
// Swagger

const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express"); 

// ------ Configure swagger docs ------
const swaggerSpecsJsDoc = swaggerJsdoc({
    definition: {
        openapi: "3.0.1",
        info: {
            title: "Component Tracker",
            description: "Backend API for Component Tracker.",
            version: "1.0.0",
            contact: {
                emai: "jagoyette@gmail.com"
            }
        },
        servers: [{
            "url": "http://localhost:3000/"
        }],
        components: {
            securitySchemes: {
                jwt: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT"
                }
            }
        },
        security: [{
            jwt: []
        }],
    },
    apis: [path.join(__dirname, "./routes/*.js")],
});

app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerSpecsJsDoc));

//////////////////////////////////////////////////////////

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
