const AthleteRepository = require('../models/strava.athlete');

// Our DTO (Data Transfer Object)
class StravaAthleteDto {
    constructor(stravaAthlete) {
        this.userId = stravaAthlete?.userId;
        this.id = stravaAthlete?.id;
        this.firstname = stravaAthlete?.firstname;
        this.lastname = stravaAthlete?.lastname;
        this.profile_medium = stravaAthlete?.profile_medium;
        this.profile = stravaAthlete?.profile;
        this.city = stravaAthlete?.city;
        this.state = stravaAthlete?.state;
        this.country = stravaAthlete?.country;
        this.sex = stravaAthlete?.sex;
        this.summit = stravaAthlete?.summit;
        this.created_at = stravaAthlete?.created_at;
        this.updated_at = stravaAthlete?.updated_at;
    }
}

// Get a user by userid
const getAthleteByUserId = async function(userId) {
    const athlete = await AthleteRepository.findById(userId);
    return !athlete ? null : new StravaAthleteDto(athlete);
};

module.exports = {
    getAthleteByUserId,
}