const mongoose = require("mongoose");
const mongooseFieldEncryption = require("mongoose-field-encryption").fieldEncryption;
const Schema = mongoose.Schema;

const appStateSchema = new Schema({
    userId: { type: String, required: true },       // Link to User Schema
    appState: String,
    appStateCookieName: String
});

// Encrypt the token fields
appStateSchema.plugin(mongooseFieldEncryption, {
    fields: ["appState"],
    secret: process.env.MONGOOSE_SECRET,
});

const AppState = mongoose.model('AppState', appStateSchema);

module.exports = AppState;