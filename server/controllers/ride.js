const { timeStamp } = require('console');
const RideModel = require('../models/ride');
const ComponentModel = require('../models/component');

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

// Retrieve rides for user
const getAthleteRides = async function (userId) {
    try {
        const rides = await RideModel.find({userId: userId});
        if (!rides) {
            // just return an empty array
            return [];
        }

        return rides.map(r => new RideDto(r));
    } catch (error) {
        console.log('Error retrieving athlete rides', error);  
    }

    return null;
}


// Retrieve specific ride
const getAthleteRide = async function (userId, id) {
    try {
        const ride = await RideModel.findById(id);

        // Make sure user owns this ride
        if (ride?.userId != userId) {
            console.log('User ' + userId + ' does not own ride ' + id);
            return null;
        }

        return new RideDto(ride);
    } catch (error) {
        console.log('Error retrieving athlete ride', error);  
    }

    return null;
}

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

// Retrieve rides for given component
const getComponentRides = async function (userId, componentId) {
    try {
        const component = await ComponentModel.findById(componentId);
        if (component) {
            const startDate = component.installDate || new Date(Date.now());
            const endDate = component.uninstallDate || new Date(Date.now());
            const rides = await RideModel.find({
                userId: userId,
                startDate: { $gte: startDate, $lte: endDate }
            });

            if (!rides) {                
                return [];
            }

            return rides.map(r => new RideDto(r));
        }
    } catch (error) {
        console.log('Error retrieving rides for component', error);  
    }

    return null;
}

module.exports = {
    RideDto,
    getAthleteStats,
    getAthleteRides,
    getAthleteRide,
    getComponentRides
}
