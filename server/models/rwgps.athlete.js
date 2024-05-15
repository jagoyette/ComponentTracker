const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// The Rwgps Athlete schema stores information about the athlete
const RwgpsAthleteSchema = new Schema({
    userId: { type: String, required: true },   // link to User schema
    id: { type: String, required: true, unique: true },       // Rwgps athlete Id
    firstName: String,
    lastName: String,
    description: String,                     
    interests: String,                
    locality: String,
    state: String,
    country: String,
    name: String,
    age: Number,
    createdAt: Date,
    updatedAt: Date
});

const RwgpsAthlete = mongoose.model('RwgpsAthlete', RwgpsAthleteSchema);

// Creates an instance of a Rwgps athlete matching the schema structure
// given the userId and result from Rwgps User API
RwgpsAthlete.fromAthlete = function(userId, user) {
    return {
        userId: userId,
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        description: user.description,
        interests: user.interests,
        locality: user.locality,
        state: user.administrative_area,
        country: user.country_code,
        name: user.name,
        age: user.age,
        createdAt: user.created_at,
        updatedAt: user.updates_at,
    };
}

// Helper method to locate an athlete in database based on supplied user profile and userid.
// A new athlete is added if not found. The athlete is returned on success, null otherwise.
RwgpsAthlete.findOrCreateAthlete = async function(userId, rwgpsUser) {
    // validate profile
    if (!rwgpsUser?.id ) {
        return null;
    }

    // look for match in database and update it
    var user = await this.findOneAndUpdate({
         userId: userId
        },
        rwgpsUser, 
        {
            upsert: true,       // create if not found
            new: true,          // return new/modified doc
        });

    return user;
}

module.exports = RwgpsAthlete;