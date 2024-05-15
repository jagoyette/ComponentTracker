const { timeStamp } = require('console');
const RideModel = require('../models/ride');

// Our DTO (Data Transfer Objects)
class RideDto {
    constructor(model) {
        this.id = model.id;
        this.userId = model.userId;
        this.rideId = model.rideId;
        this.externalId = model.externalId;
        this.athleteId = model.athleteId;
        this.provider = model.provider;
        this.title = model.title;
        this.description = model.description;
        this.distance = model.distance;
        this.movingTime = model.movingTime;
        this.gearId = model.gearId;
        this.type = model.type;
        this.sportType = model.sportType;
        this.startDate = model.startDate;
        this.commute = model.commute;
        this.trainer = model.trainer;
    }
};

// Retrieve cummulative statistics for an athlete's rides
const getAthleteStats = async function(userId) {
    try {
     // Use aggregate function to get cummulative rider stats
     const athleteStats = await RideModel.aggregate([
        { $match: { userId: userId} },
        { $group: {
            _id: null,
            totalRides: { $sum: 1 },
            totalDistance: { $sum: "$distance" },
            totalTime: { $sum: "$movingTime" }
        }},
        { $project: {
            _id: 0,
            totalRides: 1,
            totalDistance: 1,
            totalTime: 1
        }}
    ]);

    return athleteStats.at(0);

    } catch (error) {
        console.log('Error retrieving athlete statistics', error);
    }
};

module.exports = {
    RideDto,
    getAthleteStats
}
