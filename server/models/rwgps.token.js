const mongoose = require("mongoose");
const mongooseFieldEncryption = require("mongoose-field-encryption").fieldEncryption;
const Schema = mongoose.Schema;

// The Rwgps Token schema stores access tokens required to access the athlete's data
const RwgpsTokenSchema = new Schema({
    userId: { type: String, required: true },   // link to User schema
    accessToken: String,
    tokenType: String,
    scope: String,
    createdAt: Date,
    rwgpsUserId: String
});

// Encrypt the token fields
RwgpsTokenSchema.plugin(mongooseFieldEncryption, {
    fields: ["accessToken"],
    secret: process.env.MONGOOSE_SECRET,
});

const RwgpsToken = mongoose.model('RwgpsToken', RwgpsTokenSchema);

// Helper method to update or create a RwgpsToken entry
RwgpsToken.createOrUpdateToken = async function(rwgpsToken) {
    // validate profile
    if (!rwgpsToken || !rwgpsToken.userId) {
        return null;
    }

    // find and update entry
    const token = await RwgpsToken.findOneAndUpdate(
        {userId: rwgpsToken.userId },      // filter
        rwgpsToken,                        // update
        { 
            upsert: true,                   // options - insert if not found
            new: true,                      // return new / modified doc
         }                    
    );

    return token;
}

// Create a token from results of RWGPS Api 
RwgpsToken.createFromRwgps = function(userId, response) {
    return response ?  {
        userId: userId,
        accessToken: response.access_token,
        tokenType: response.token_type,
        scope: response.scope,
        createdAt: new Date(response.created_at * 1000),
        rwgpsUserId: response.user_id
    } : null;
}


module.exports = RwgpsToken;