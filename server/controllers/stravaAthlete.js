const AthleteRepository = require('../models/strava.athlete');
const TokenController = require('./stravaToken');
const Ride = require('../models/ride');
const axios = require('axios').default;

// Our DTO (Data Transfer Object)
class StravaAthleteDto {
    constructor(stravaAthlete) {
        this.userId = stravaAthlete?.userId;
        this.id = stravaAthlete?.id;
        this.firstName = stravaAthlete?.firstName;
        this.lastName = stravaAthlete?.lastName;
        this.profileMedium = stravaAthlete?.profileMedium;
        this.profile = stravaAthlete?.profile;
        this.city = stravaAthlete?.city;
        this.state = stravaAthlete?.state;
        this.country = stravaAthlete?.country;
        this.sex = stravaAthlete?.sex;
        this.summit = stravaAthlete?.summit;
        this.createdAt = stravaAthlete?.createdAt;
        this.updatedAt = stravaAthlete?.updatedAt;
    }
}

// Get a user by userid
const getAthleteByUserId = async function(userId) {
    try {
        const athlete = await AthleteRepository.findOne({userId});
        return !athlete ? null : new StravaAthleteDto(athlete);
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

// Retrieves ride data from Strava and updates user rides
const synchronizeRides = async function(userId) {
    try {
        // retrieve the athlete
        const athlete = await this.getAthleteByUserId(userId);
        if (!athlete) {
            console.log(`User Id ${userId} not found`);
            return;
        }

        const name = `${athlete.firstName} ${athlete.lastName}`;
        console.log('Synchronizing Strava rides for Athlete ' + name);

        // get the token
        const tokenContainer = await TokenController.getToken(userId);
        const url = 'https://www.strava.com/api/v3/athlete/activities';

        // loop over every year
        const dateStart = athlete.createdAt || new Date();
        const yearStart = dateStart.getFullYear();
        const yearNow = new Date().getFullYear();
        let numRides = 0;
        let duplicates = 0;
        for (year = yearStart; year <= yearNow; year++) {
            console.log(`Checking rides for athlete ${name} in year ${year}...`);
            let page = 1;

            // Keep looping until we retrieved all pages
            while (1) {
                try {
                    const result = await axios.get(url, {
                        params: {
                            before: new Date(year+1, 0, 1).getTime()/1000,
                            after: new Date(year, 0, 1).getTime()/1000,
                            page: page,
                            per_page: 100
                        },
                        headers: {
                            "Authorization": "Bearer " +  tokenContainer.accessToken
                        }
                    });

                    // Break out of paged query when we get back no results
                    const stravaRides = result.data;
                    if (!stravaRides?.length) {
                        break;
                    }

                    console.log('Updating ' + stravaRides.length + ' Strava rides');
                    const rides = stravaRides.map( r => Ride.fromStravaRide(userId, r));

                    // Iterate and update/add each ride
                    rides.forEach( async (ride) => {
                        try {
                            // update this ride
                            const res = await Ride.findOneAndUpdate({
                                rideId: ride.rideId
                            }, ride, {
                                upsert: true,       // Insert if not found
                                new: true,          // Return new/modified doc
                            });

                            numRides++;
                        } catch (error) {
                            if (error.codeName === 'DuplicateKey') {
                                duplicates++;
                            } else {
                                console.log('Error updating ride ' + ride?.rideId, error);
                            }
                        }
                    });
                } catch (error) {
                    console.log('Error retrieving Strava activities', error);
                    break;
                }

                // Try next page
                page++;
            }
        }

        console.log(`Finished Synchronizing Strava rides - ${numRides} updated, ${duplicates} duplicates suppressed.`);
        return numRides;
    } catch (error) {
        console.log('Error synchronizing athlete rides', error);
    }
}

module.exports = {
    getAthleteByUserId,
    deleteAthlete,
    synchronizeRides
}