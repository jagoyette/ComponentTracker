const ComponentModel = require('../models/component');
const RideModel = require('../models/ride');

// Our DTO (Data Transfer Objects)
class ComponentEventDto {
    constructor(model) {
        // required fields
        this.id = model.id;
        this.eventType = model.eventType,
        this.eventDate = model.eventDate,

        this.description = model.description,
        this.rideId = model.rideId,
        this.distance = model.distance ?? 0,
        this.time = model.time ?? 0
    }
}
class ComponentDto {
    constructor(model) {
        // required fields
        this.id = model.id,
        this.userId = model.userId;
        this.category = model.category;
        this.name = model.name;

        this.description = model.description;
        this.manufacturer = model.manufacturer;
        this.model = model.model;
        this.isActive = model.isActive;
        this.installDate = model.installDate;
        this.retireDate = model.retireDate;
        this.history = model.history?.length > 0 ?
            model.history?.map(v => v ? new ComponentEventDto(v) : null) : [];

        // Compute totals from history
        this.totalDistance = model.history?.reduce( (acc, cur) => acc + (cur?.distance ?? 0), 0);
        this.totalTime = model.history?.reduce( (acc, cur) => acc + (cur?.time ?? 0), 0);
    }
}

const getComponentById = async function(userId, componentId) {
    try {
        const componentModel = await ComponentModel.findById(componentId);

        // Make sure the user owns this component
        if (componentModel?.userId !== userId) {
            console.log('User ' + userId + ' does not own component ' + componentId);
            return null;
        } else {
            return new ComponentDto(componentModel);
        }
    } catch (error) {
        console.log('Error retrieving component', error);
        return null;
    }
};

const deleteComponent = async function(userId, componentId) {
    try {
        const componentModel = await ComponentModel.findOneAndDelete({
            userId: userId,
            _id: componentId
        });
        return !componentModel ? null : new ComponentDto(componentModel);
    } catch (error) {
        console.log('Error deleting component', error);
        return null;
    }
};

const updateComponent = async function(userId, componentId, componentDto) {
    try {
        // look for the component using user and componentid and update it
        const componentModel = await ComponentModel.findOneAndUpdate({
                userId: userId,
                _id: componentId
            },
            componentDto, {
                new: true
            });
        return !componentModel ? null : new ComponentDto(componentModel);
    } catch (error) {
        console.log('Error updating component', error);
        return null;
    }
};

const createComponent = async function(userId, componentDto) {
    try {
         // insert userId
        componentDto.userId = userId;
        const componentModel = await ComponentModel.create(componentDto);
        return !componentModel ? null : new ComponentDto(componentModel);
    } catch (error) {
        console.log('Error creating component', error);
        return null;
    }
};

/**
 * Adds a specific event to the event history of a component.
 * 
 * @param userId            The id of the current user
 * @param componentId       The Id of the component
 * @param componentEventDto The event to add 
 * 
 * @returns {Promise<ComponentDto>} Returns an object containing the component
 **/
const addComponentEvent = async function(userId, componentId, componentEventDto) {
    try {
        const componentModel = await ComponentModel.findOneAndUpdate({
            userId: userId,
            _id: componentId
        }, { 
            $push: { history: componentEventDto } 
        }, {
            new: true
        });

        return !componentModel ? null : new ComponentDto(componentModel);
    } catch (error) {
        console.log('Error adding component event', error);
        return null;
    }
};

/**
 * Retrieves a specific event from the event history of a component.
 * 
 * @param userId            The id of the current user
 * @param componentId       The Id of the component
 * @param componentEventId  The Id of the event
 * 
 * @returns {Promise<ComponentEventDto>} Returns an object containing the event
 **/
const getComponentEvent = async function(userId, componentId, componentEventId) {
    try {
        // First retreive this component
        const componentModel = await ComponentModel.findOne({
            userId: userId,
            _id: componentId
        });

        // Now find the specific event
        const event = componentModel?.history?.find(e => e.id === componentEventId);
        if (!event) {
            return null;
        }

        return new ComponentEventDto(event);
    } catch (error) {
        console.log('Error retrieving component event', error);
        return null;
    }
};

/**
 * Updates a specific event from the event history of a component.
 * 
 * @param userId            The id of the current user
 * @param componentId       The Id of the component
 * @param componentEventId  The Id of the event
 * @param componentEventDto The event data to update
 * 
 * @returns {Promise<ComponentEventDto>} Returns an object containing the event
 **/
const updateComponentEvent = async function(userId, componentId, componentEventId, componentEventDto) {
    try {
        // First retreive this component
        const componentModel = await ComponentModel.findOne({
            userId: userId,
            _id: componentId
        });

        // Now find the specific event
        const event = componentModel?.history?.find(e => e.id === componentEventId);
        if (!event) {
            return null;
        }

        event = componentEventDto;
        await componentModel.save();

        return new ComponentEventDto(event);
    } catch (error) {
        console.log('Error rertieving component event', error);
        return null;
    }
};

/**
 * Removes a specific event from the event history of a component.
 * 
 * @param userId            The id of the current user
 * @param componentId       The Id of the component
 * @param componentEventId  The Id of the event
 * 
 * @returns {Promise<ComponentEventDto>} Returns an object containing the event removed
 **/
const removeComponentEvent = async function(userId, componentId, componentEventId) {
    try {
        const componentModel = await ComponentModel.findOneAndUpdate({
            userId: userId,
            _id: componentId
        }, { 
            $pull: { history: {id : componentEventId} } 
        }, {
            new: true
        });

        // Return the event
        const event = componentModel?.history?.find(e => e.id === componentEventId);
        return !event ? null : new ComponentEventDto(event);
    } catch (error) {
        console.log('Error removing component event', error);
        return null;
    }
};

/**
 * Synchronizes the event history of a component with the user's ride data.
 * The user's ride history will be scanned and any ride taken that contains
 * this component will be added to the component's event history
 * 
 * @param userId            The id of the current user
 * @param componentId       The Id of the component
 * 
 * @returns {Promise<ComponentDto>} Returns an object containing the component
 * with added history.
 **/
const synchronizeComponentRides = async function(userId, componentId) {
    try {
        // Retrieve the component
        const componentModel = await ComponentModel.findOne({
            userId: userId,
            _id: componentId
        });

        // Access component history
        const componentHistory = componentModel.history;

        // Retrieve the user's ride data using date range of component installation life
        const startDate = componentModel.installDate || new Date(Date.now());
        const endDate = componentModel.retireDate || new Date(Date.now());
        const rides = await RideModel.find({
            userId: userId,
            startDate: { $gte: startDate, $lte: endDate },
            // TODO: We need to match the gear used for ride
        });

        // Make sure all of these rides are in the component history
        let totalRides = 0;
        for (let index = 0; index < rides.length; index++) {
            const ride = rides[index];
            if (!componentHistory.find(e => e.rideId === ride.rideId)) {
                // This ride is not present
                console.log('Adding ride ' + ride.rideId + ' to history of component ' + componentId);
                const event = new ComponentEventDto({
                    eventType: 'RIDE',
                    eventDate: ride.startDate,
                    description: ride.name,
                    rideId: ride.rideId,
                    distance: ride.distance,
                    time: ride.movingTime
                });

                // Add the ride to component history
                componentHistory.push(event);
                totalRides++;
            }
        }

        // Save the document
        await componentModel.save();
        console.log('Updated component ' + componentId + ' with ' + totalRides + ' new rides.');

        // Return the component
        return new ComponentDto(componentModel);
    } catch (error) {
        console.log('Error synchronizing component rides', error);
        return null;
    }
};


/**
 * Retrieves a list of all components owned by a user
 * 
 * @param userId            The id of the user
 * 
 * @returns {Promise<ComponentDto[]>} Returns an array of components
 **/
const getComponentsForUser = async function(userId) {
    try {
        const models = await ComponentModel.find({userId: userId});
        if (!models) {
            return null;
        }

        // convert to DTOs
        return models.map(m => new ComponentDto(m));

    } catch (error) {
        console.log('Error retrieving components for user', error);
        return null;
    }
};

module.exports = {
    ComponentDto,
    ComponentEventDto,
    getComponentById,
    deleteComponent,
    updateComponent,
    createComponent,
    addComponentEvent,
    getComponentEvent,
    updateComponentEvent,
    removeComponentEvent,
    synchronizeComponentRides,
    getComponentsForUser
}