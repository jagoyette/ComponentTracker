const mongoose = require("mongoose");

// Connect to database
async function connect() {
    const CONNECTION_STRING = process.env.CONNECTION_STRING || 
                            'mongodb://localhost:27017/component-tracker';
    try {
        console.log('Connecting to database...');
        await mongoose.connect(CONNECTION_STRING);
        console.log("Connected to database successfully.");
    } catch (error) {
        console.log(err.reason);
    }
}

connect();

module.exports = mongoose;