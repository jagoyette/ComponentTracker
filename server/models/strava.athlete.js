const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// The Strava Athlete schema stores information about the athlete and
// access tokens required to access the athlete's data
const stravaAthleteSchema = new Schema({
    userId: { type: String, required: true },   // link to User schema
    id: { type: String, required: true, unique: true },       // Strava athlete Id
    firstName: String,
    lastName: String,
    profileMedium: String,                     // med profile pic url
    profile: String,                            // profile pic url
    city: String,
    state: String,
    country: String,
    sex: String,
    summit: Boolean,
    createdAt: Date,
    updatedAt: Date
});

const StravaAthlete = mongoose.model('StravaAthlete', stravaAthleteSchema);

// Creates an instance of a strava athlete matching the schema structure
// given the userId and result from Strava Athlete API
StravaAthlete.fromAthlete = function(userId, athlete) {
    return {
        userId: userId,
        id: athlete.id,
        firstName: athlete.firstname,
        lastName: athlete.lastname,
        profileMedium: athlete.profile_medium,
        profile: athlete.profile,
        city: athlete.city,
        state: athlete.state,
        country: athlete.country,
        sex: athlete.sex,
        summit: athlete.summit,
        createdAt: athlete.created_at,
        updatedAt: athlete.updated_at
    };
}

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
            upsert: true,       // create if not found
            new: true,          // return new/modified doc
        }).exec();

    return athlete;
}

module.exports = StravaAthlete;