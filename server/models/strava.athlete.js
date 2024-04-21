const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// The Strava Athlete scheme stores information about the athlete and
// access tokens required to access the athlete's data
const stravaAthleteSchema = new Schema({
    userId: { type: String, required: true },   // link to User schema
    id: { type: String, required: true },       // Strava athlete Id
    firstname: String,
    lastname: String,
    profile_medium: String,                     // med profile pic url
    profile: String,                            // profile pic url
    city: String,
    state: String,
    country: String,
    sex: String,
    summit: Boolean,
    created_at: Date,
    updated_at: Date
});

const StravaAthlete = mongoose.model('StravaAthlete', stravaAthleteSchema);

// Helper method to locate an athlete in database based on supplied profile (passportjs) and userid.
// A new athlete is added if not found. The athlete is returned on success, null otherwise.
StravaAthlete.findOrCreateAthlete = async function(stravaAthlete) {
    // validate profile
    if (!stravaAthlete || !stravaAthlete.id || !stravaAthlete.userId) {
        return null;
    }

    // look for match in database and update it
    var athlete = await this.findOneAndUpdate({
         userId: stravaAthlete.userId
        },
        stravaAthlete, {
            upsert: true        // create if not found
        }).exec();

    return athlete;
}

module.exports = StravaAthlete;