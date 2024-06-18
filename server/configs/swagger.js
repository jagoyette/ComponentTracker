const swaggerJsdoc = require("swagger-jsdoc");
const path = require("path");

// ------ Configure swagger docs ------
const swaggerSpecs = swaggerJsdoc({
    definition: {
        openapi: "3.0.1",
        info: {
            title: "Component Tracker",
            description: `Backend API for Component Tracker.
            Obtain a JWT authorization token by logging into the app at /auth/google/login
            `,
            version: "1.0.0",
        },
        servers: [{ url: '/api' }],
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
    apis: [path.join(__dirname, "../routes/*.js")],
});


module.exports = swaggerSpecs;