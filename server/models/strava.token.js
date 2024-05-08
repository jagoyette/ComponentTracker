const mongoose = require("mongoose");
const mongooseFieldEncryption = require("mongoose-field-encryption").fieldEncryption;
const Schema = mongoose.Schema;

// The Strava Token schema stores access tokens required to access the athlete's data
const stravaTokenSchema = new Schema({
    userId: { type: String, required: true },   // link to User schema
    accessToken: String,
    expiresAt: Date,
    refreshToken: String
});

// Encrypt the token fields
stravaTokenSchema.plugin(mongooseFieldEncryption, {
    fields: ["accessToken", "refreshToken"],
    secret: process.env.MONGOOSE_SECRET,
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
        { 
            upsert: true,                   // options - insert if not found
            new: true,                      // return new / modified doc
         }                    
    );

    return token;
}

// Create a token from results of refresh token
StravaToken.createFromRefreshResult = function(userId, refreshResult) {
    return refreshResult ?  {
        userId: userId,
        accessToken: refreshResult.access_token,
        expiresAt: new Date(refreshResult.expires_at * 1000),
        refreshToken: refreshResult.refresh_token
    } : null;
}


module.exports = StravaToken;