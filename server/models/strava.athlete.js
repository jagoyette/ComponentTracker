const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// The Strava Athlete scheme stores information about the athlete and 
// access tokens required to access the athlete's data
const stravaAthleteSchema = new Schema({
    userId: { type: String, required: true },   // link to User schema
    profile: {
        id: { type: String, required: true },
        displayName: String,
        name: {
            familyName: String,
            givenName: String,
            middleName: String
        },
        emails: [{
            value: String,
            type: {type: String}        // Use object notation because field name is 'type'
        }],
        photos: [{
            value: String
        }]
    }
});

const StravaAthlete = mongoose.model('StravaAthlete', stravaAthleteSchema);


module.exports = StravaAthlete;