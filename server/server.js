const express = require("express");
const mongoose = require("mongoose");

// Read .env file
require("dotenv").config();

// Connect to database
const CONNECTION_STRING = process.env.CONNECTION_STRING || 'mongodb://localhost:27017/';
mongoose.connect(CONNECTION_STRING)
    .then(console.log("Connected to database"))
    .catch(err => console.log(err.reason));

// Create server app
const app = express();

app.get("/", (req, res) => {
    res.send("I am your server");
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
