const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// The ride schema represents a single ride by a user
const rideSchema = new Schema({
    userId: { type: String, required: true },       // Link to User Schema
    provider: { type: String, required: true },     // Strava, Manual, etc...
    rideId: {type: String, required: true},         // Unique Id for this ride
    athleteId: String,                              // Id of athlete on provider platform
    gearId: String,                                 // Id of bike gear used    
    externalId: String,                             // An optional external Id                          
    title: String,                                  // Ride title / name
    description: String,                            // User description of ride
    distance: Number,                               // Total distance in meters
    startDate: Date,                                // timestamp of start time in UTC
    movingTime: Number,                             // moving time in seconds
    type: String,                                   // Activity type (Strava => "Ride")
    sportType: String,                              // additional type classification
    trainer: Boolean,                               // Flag indicating if trainer was used
    commute: Boolean,                               // Flag indicating if ride was a commute
});

const Ride = mongoose.model('Ride', rideSchema);

/// Creates an instance of a Ride data object using an activity from Strava
Ride.fromStravaRide = function(userId, stravaRide) {
    return {
        userId: userId,
        provider: 'Strava',
        rideId: stravaRide.id,
        athleteId: stravaRide.athlete?.id,
        externalId: stravaRide.external_id,
        title: stravaRide.name,
        description: stravaRide.description,
        distance: stravaRide.distance,
        startDate: stravaRide.start_date,
        movingTime: stravaRide.moving_time,
        gearId: stravaRide.gear_id,
        type: stravaRide.type,
        sportType: stravaRide.sport_type,
        trainer: stravaRide.trainer,
        commute: stravaRide.commute,
    };
}

Ride.fromRwgpsRide = function(userId, rwgpsRide) {
    return {
        userId: userId,
        provider: 'RWGPS',
        rideId: rwgpsRide.id,
        athleteId: rwgpsRide.user_id,
        title: rwgpsRide.name,
        description: rwgpsRide.description,
        distance: rwgpsRide.distance,
        startDate: rwgpsRide.departed_at,
        movingTime: rwgpsRide.moving_time,
        gearId: rwgpsRide.gear_id,
        type: rwgpsRide.activity_type_id,
        sportType: rwgpsRide.activity_category_id,
        trainer: rwgpsRide.is_stationary,
    };
}

module.exports = Ride;