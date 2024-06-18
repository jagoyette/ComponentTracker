const BikeModel = require("../models/bike");

class BikeDto {
    constructor(model) {
        this.id = model.id;
        this.userId = model.userId;
        this.name = model.name;
        this.gearId = model.gearId;
        this.description = model.description;
        this.manufacturer = model.manufacturer;
        this.model = model.model;
        this.default = model.default;
    }
}

/**
 * Retrieves bikes for the given user
 * 
 * @param {string} userId           The user Id
 * 
 * @returns {Promise<BikeDto[]>}    Returns an array of bikes
 */
const getBikesForUser = async function(userId) {
    try {
        const models = await BikeModel.find({userId: userId});
        if (!models) {
            return null;
        }

        // convert to DTOs
        return models.map(m => new BikeDto(m));

    } catch (error) {
        console.log('Error retrieving bikes for user', error);
        return null;
    }
}

/**
 * Retrieves a specific bike by its unique Id
 * 
 * @param userId            The id of the current user
 * @param bikeId            The Id of the bike
 * 
 * @returns {Promise<BikeDto>} Returns an object containing the bike
 **/
const getBikeById = async function(userId, bikeId) {
    try {
        const bikeModel = await BikeModel.findById(bikeId);

        // Make sure the user owns this bike
        if (bikeModel?.userId !== userId) {
            console.log('User ' + userId + ' does not own bike ' + bikeId);
            return null;
        } else {
            return new BikeDto(bikeModel);
        }
    } catch (error) {
        console.log('Error retrieving bike', error);
        return null;
    }
};

/**
 * Creates a new bike
 * 
 * @param userId            The id of the current user
 * @param bikeDto           A BikeDto object containing details of bike
 * 
 * @returns {Promise<BikeDto>} Returns an object containing the created bike
 **/
const createBike = async function(userId, bikeDto) {
    try {
         // insert userId
        bikeDto.userId = userId;
        const bikeModel = await BikeModel.create(bikeDto);
        if (!bikeModel) {
            return null;
        }

        return new BikeDto(bikeModel);
    } catch (error) {
        console.log('Error creating bike', error);
        return null;
    }
};

/**
 * Updates a specific bike
 * 
 * @param userId            The id of the current user
 * @param bikeId            The Id of the bike
 * @param bikeDto           A BikeDto object containing details to update
 * 
 * @returns {Promise<BikeDto>} Returns an object containing the updated bike
 **/
const updateBike = async function(userId, bikeId, bikeDto) {
    try {
        // look for the bike using user and bike id and update it
        const bikeModel = await BikeModel.findOneAndUpdate({
                userId: userId,
                _id: bikeId
            },
            bikeDto, {
                new: true
            });

        if (!bikeModel) {
            return null;
        }

        return new BikeDto(bikeModel);
    } catch (error) {
        console.log('Error updating bike', error);
        return null;
    }
};

/**
 * Deletes a bike using its unique Id
 * 
 * @param userId       The id of the current user
 * @param bikeId       The Id of the bike
 * 
 * @returns {Promise<BikeDto>} Returns an object containing the deleted bike
 **/
const deleteBike = async function(userId, bikeId) {
    try {
        const bikeModel = await BikeModel.findOneAndDelete({
            userId: userId,
            _id: bikeId
        });
        return !bikeModel ? null : new BikeDto(bikeModel);
    } catch (error) {
        console.log('Error deleting bike', error);
        return null;
    }
};


module.exports = {
    BikeDto,
    getBikesForUser,
    getBikeById,
    createBike,
    updateBike,
    deleteBike
}