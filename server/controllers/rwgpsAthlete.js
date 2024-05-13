const AthleteRepository = require('../models/rwgps.athlete');
const TokenController = require('../controllers/rwgpsToken');
const Ride = require('../models/ride');
const axios = require('axios').default;

// Our DTO (Data Transfer Object)
class RwgpsAthleteDto {
    constructor(rwgpsAthlete) {
        this.userId = rwgpsAthlete?.userId;
        this.id = rwgpsAthlete?.id;
        this.firstName = rwgpsAthlete?.firstName;
        this.lastName = rwgpsAthlete?.lastName;
        this.description = rwgpsAthlete?.description;
        this.interests = rwgpsAthlete?.interests;
        this.locality = rwgpsAthlete?.locality;
        this.state = rwgpsAthlete?.state;
        this.country = rwgpsAthlete?.country;
        this.name = rwgpsAthlete?.name;
        this.age = rwgpsAthlete?.age;
        this.createdAt = rwgpsAthlete?.createdAt;
        this.updatedAt = rwgpsAthlete?.updatedAt;
    }
}

// Get a user by userid
const getAthleteByUserId = async function(userId) {
    try {
        const athlete = await AthleteRepository.findOne({userId});
        return !athlete ? null : new RwgpsAthleteDto(athlete);
    } catch (error) {
        console.log('Error retrieving athlete', error);
    }
};

const deleteAthlete = async function(userId) {
    try {
        await AthleteRepository.deleteMany( {userId: userId})
    } catch (error) {
        console.log('Error deleting athlete', error);
    }
};

// Retrieves ride data from Ride with GPS and updates user rides
const synchronizeRides = async function(userId) {
    try {
        // retrieve the athlete
        const athlete = await this.getAthleteByUserId(userId);
        if (!athlete) {
            console.log(`User Id ${userId} not found`);
            return;
        }

        const name = `${athlete.firstName} ${athlete.lastName}`;
        console.log('Synchronizing RWGPS rides for Athlete ' + name);

        // get the token
        const tokenContainer = await TokenController.getToken(userId);
        const url = `https://ridewithgps.com/users/${tokenContainer.rwgpsUserId}/trips.json`;

        // API Key must be included in request header
        const rwgpsApiKey = process.env.RWGPS_API_KEY;
        const rwgpsApiVersion = 2;

        // Keep looping until we retrieved all pages
        console.log(`Checking rides for athlete ${name}...`);
        let numRides = 0;
        let offset = 0;
        const limit = 100;
        while (1) {
            try {
                // get user rides
                const result = await axios.get(url, {
                    params: {
                        offset: offset,
                        limit: limit
                    },
                    headers: {
                        "Authorization": "Bearer " +  tokenContainer.accessToken,
                        "x-rwgps-api-key": rwgpsApiKey,
                        "x-rwgps-api-version": rwgpsApiVersion
                    }
                });

                // Break out of paged query when we get back no results
                const rwgpsTotalRides = result.data?.results_count;
                const rwgpsRides = result.data?.results;
                if (!rwgpsRides?.length) {
                    break;
                }

                console.log('Updating ' + rwgpsRides.length + ' rwgps rides');
                const rides = rwgpsRides.map( r => Ride.fromRwgpsRide(userId, r));

                // Iterate and update/add each ride
                rides.forEach( async (ride) => {
                    try {
                        const rideId = ride.rideId;

                        // check if this ride already exists from another provider
                        const prevRide = await Ride.findOne({
                            externalId: { $regex: rideId + '*' }
                        });

                        if (!prevRide) {
                            // add/update this ride
                            await Ride.findOneAndUpdate({
                                rideId: rideId
                            }, ride,
                            {
                                upsert: true,       // Insert if not found
                            });
                        }
                    } catch (error) {
                        console.log('Error updating ride ' + ride?.rideId, error);
                    }
                });
            } catch (error) {
                console.log('Error retreiving rwgps activities', error);
                break;
            }

            // try next set
            offset += limit;
        }

        return numRides;
    } catch (error) {
        console.log('Error synchronizing athlete rides', error);
    }
};

module.exports = {
    getAthleteByUserId,
    deleteAthlete,
    synchronizeRides
}