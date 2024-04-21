const { before, after } = require('node:test');
const AthleteRepository = require('../models/strava.athlete');
const TokenController = require('./stravaToken');
const Ride = require('../models/ride');
const axios = require('axios').default;

// Our DTO (Data Transfer Object)
class StravaAthleteDto {
    constructor(stravaAthlete) {
        this.userId = stravaAthlete?.userId;
        this.id = stravaAthlete?.id;
        this.firstname = stravaAthlete?.firstname;
        this.lastname = stravaAthlete?.lastname;
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
    const athlete = await AthleteRepository.findOne({userId});
    return !athlete ? null : new StravaAthleteDto(athlete);
};

// Retrieves ride data from Strava and updates user rides
const synchronizeRides = async function(userId) {
    // retrieve the athlete
    const athlete = await this.getAthleteByUserId(userId);
    if (!athlete) {
        console.log(`User Id ${userId} not found`);
        return;
    }

    const name = `${athlete.firstname} ${athlete.lastname}`;
    console.log('Synchronizing Strava rides for Athlete ' + name);

    // get the token
    const tokenContainer = await TokenController.getToken(userId);
    const url = 'https://www.strava.com/api/v3/athlete/activities';

    // loop over every year
    const dateStart = athlete.created_at;
    const yearStart = dateStart.getFullYear();
    const yearNow = new Date().getFullYear();
    let numRides = 0;
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
                            upsert: true        // Insert if not found
                        });                        
                    } catch (error) {
                        console.log('Error updating ride ' + ride?.rideId, error);
                    }
                });
            } catch (error) {
                console.log('Error retreiving Strava activities', error);
                break;
            }

            // Try next page
            page++;
        }
    }

    return numRides;
}

module.exports = {
    getAthleteByUserId,
    synchronizeRides
}