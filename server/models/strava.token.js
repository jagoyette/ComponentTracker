const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// The Strava Token scheme stores access tokens required to access the athlete's data
const stravaTokenSchema = new Schema({
    userId: { type: String, required: true },   // link to User schema
    accessToken: String,
    expiresAt: Date,
    refreshToken: String
});

const StravaToken = mongoose.model('StravaToken', stravaTokenSchema);


module.exports = StravaToken;