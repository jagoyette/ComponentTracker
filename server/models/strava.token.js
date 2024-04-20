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

// Helper method to update or create a StravaToken entry
StravaToken.createOrUpdateToken = async function(stravaToken) {
    // validate profile
    if (!stravaToken || !stravaToken.userId) {
        return null;
    }

    // find and update entry
    const token = await StravaToken.findOneAndUpdate( 
        {userId: stravaToken.userId },      // filter
        stravaToken,                        // update
        { upsert: true }                    // options - insert if not found
    );
    
    return token;
}



module.exports = StravaToken;