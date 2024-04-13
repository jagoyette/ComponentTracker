const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// The User schema is based on the normailized profile from Passport
// see https://www.passportjs.org/reference/normalized-profile/
const userSchema = new Schema({
    provider: { type: String, required: true },
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
});

const User = mongoose.model('User', userSchema);

User.findUserByProviderId = async function(provider, id) {
    if (!id) {
        return null;
    }

    // look for match in database
    return await this.findOne({ id: id, provider: provider }).exec();    
}

// Helper method to locate a user in database based on supplied profile (passportjs).
// A new user is added if not found. The user is returned on success, null otherwise.
User.findOrCreateUser = async function(profile) {
    // validate profile
    if (!profile || !profile.id || !profile.provider) {
        return null;
    }

    // look for match in database
    var user = await this.findOne({ id: profile.id, provider: profile.provider }).exec();
    if (!user) {
        // Add this user to our database
        await this.create([profile]);
        user = await this.findOne({ id: profile.id, provider: profile.provider }).exec();
    }

    return user;
}

module.exports = User;