const ComponentModel = require('../models/component');
const RideModel = require('../models/ride');

// Our DTO (Data Transfer Objects)
class ServiceIntervalDto {
    constructor(model) {
        this.id = model.id;
        this.name = model.name;
        this.distance = model.distance;
        this.time = model.time;
        this.rides = model.rides;
        this.description = model.description;
    }
};

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
        this.isInstalled = model.isInstalled;
        this.installDate = model.installDate;
        this.uninstallDate = model.uninstallDate;
        this.serviceIntervals = model.serviceIntervals?.length > 0 ?
            model.serviceIntervals?.map(v => v ? new ServiceIntervalDto(v) : null) : [];

        // Stats
        this.totalRides = model.totalRides;
        this.totalDistance = model.totalDistance;
        this.totalTime = model.totalTime;
    }
};

/*******************************************************************************************
 * Component Methods
 ******************************************************************************************/

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

/**
 * Retrieves a specific component by its unique Id
 * 
 * @param userId            The id of the current user
 * @param componentId       The Id of the component
 * 
 * @returns {Promise<ComponentDto>} Returns an object containing the component
 **/
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

/**
 * Deletes a specific component using its unique Id
 * 
 * @param userId            The id of the current user
 * @param componentId       The Id of the component
 * 
 * @returns {Promise<ComponentDto>} Returns an object containing the deleted component
 **/
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

/**
 * Updates a specific component
 * 
 * @param userId            The id of the current user
 * @param componentId       The Id of the component
 * @param componentDto      An ComponentDto object containing details to update
 * 
 * @returns {Promise<ComponentDto>} Returns an object containing the updated component
 **/
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

        if (!componentModel) {
            return null;
        }

        // Sync component with rides
        return await synchronizeComponentRides(userId, componentModel.id);
    } catch (error) {
        console.log('Error updating component', error);
        return null;
    }
};

/**
 * Creates a new component
 * 
 * @param userId            The id of the current user
 * @param componentDto      An ComponentDto object containing details of component
 * 
 * @returns {Promise<ComponentDto>} Returns an object containing the created component
 **/
const createComponent = async function(userId, componentDto) {
    try {
         // insert userId
        componentDto.userId = userId;
        const componentModel = await ComponentModel.create(componentDto);
        if (!componentModel) {
            return null;
        }

        // Sync new component with rides
        return await synchronizeComponentRides(userId, componentModel.id);
    } catch (error) {
        console.log('Error creating component', error);
        return null;
    }
};

/**
 * Synchronizes a component's stats with the user's ride data.
 * Updates the totalRides, totalDistance and totalTime properties.
 * 
 * @param userId            The id of the current user
 * @param componentId       The Id of the component
 * 
 * @returns {Promise<ComponentDto>} Returns an object containing the updated component
 *
 **/
const synchronizeComponentRides = async function(userId, componentId) {
    try {
        // Retrieve the component
        const componentModel = await ComponentModel.findOne({
            userId: userId,
            _id: componentId
        });

        if (!componentModel) {
            return null;
        }

        // Retrieve the user's ride data using date range of component installation life
        const startDate = componentModel.installDate || new Date(Date.now());
        const endDate = componentModel.uninstallDate || new Date(Date.now());

        // TODO: We need to incorporate Bike / Gear Ids

        // Use aggregate function to get cummulative stats for this component
        const componentStats = await RideModel.aggregate([
            { 
                $match: { 
                    userId: userId,
                    startDate: { $gte: startDate, $lte: endDate },
                } 
            },
            {
                $group: {
                    _id: null,
                    totalRides: { $sum: 1 },
                    totalDistance: { $sum: "$distance" },
                    totalTime: { $sum: "$movingTime" }
                }
            },
            {
                $project: {
                    _id: 0,
                    totalRides: 1,
                    totalDistance: 1,
                    totalTime: 1
                }
            }
        ]);

        // update component stats
        if (componentStats.length > 0) {
            const stats = componentStats[0];
            componentModel.totalRides = stats.totalRides;
            componentModel.totalDistance = stats.totalDistance;
            componentModel.totalTime = stats.totalTime;
        }

        // Save the document
        await componentModel.save();
        console.log('Updated component ' + componentId + ' with ' + componentModel.totalRides + ' rides.');

        // Return the component
        return new ComponentDto(componentModel);
    } catch (error) {
        console.log('Error synchronizing component rides', error);
        return null;
    }
};

/*******************************************************************************************
 * Component Service Interval Methods
 ******************************************************************************************/

/**
 * Adds a service interval to a component.
 * 
 * @param userId            The id of the current user
 * @param componentId       The Id of the component
 * @param serviceIntervalDto The service interval to add 
 * 
 * @returns {Promise<ComponentDto>} Returns an object containing the component with
 * newly added service interval.
 **/
const addComponentService = async function(userId, componentId, serviceIntervalDto) {
    try {
        const componentModel = await ComponentModel.findOneAndUpdate({
            userId: userId,
            _id: componentId
        }, { 
            $push: { serviceIntervals: serviceIntervalDto } 
        }, {
            new: true
        });

        return !componentModel ? null : new ComponentDto(componentModel);
    } catch (error) {
        console.log('Error adding component service interval', error);
        return null;
    }
};

/**
 * Retrieves a specific service interval from a component.
 * 
 * @param userId            The id of the current user
 * @param componentId       The Id of the component
 * @param componentServiceId  The Id of the service interval
 * 
 * @returns {Promise<ServiceIntervalDto>} Returns an object containing the service interval
 **/
const getComponentService = async function(userId, componentId, componentServiceId) {
    try {
        // First retreive this component
        const componentModel = await ComponentModel.findOne({
            userId: userId,
            _id: componentId
        });

        // Now find the specific service
        const service = componentModel?.serviceIntervals?.find(e => e.id === componentServiceId);
        if (!service) {
            return null;
        }

        return new ServiceIntervalDto(service);
    } catch (error) {
        console.log('Error retrieving component service interval', error);
        return null;
    }
};

/**
 * Updates a specific service interval of a component.
 * 
 * @param userId            The Id of the current user
 * @param componentId       The Id of the component
 * @param componentServiceId  The Id of the service interval
 * @param serviceIntervalDto The service interval data to update
 * 
 * @returns {Promise<ServiceIntervalDto>} Returns an object containing the updated service interval
 **/
const updateComponentService = async function(userId, componentId, componentServiceId, serviceIntervalDto) {
    try {
        // First retreive this component
        const componentModel = await ComponentModel.findOne({
            userId: userId,
            _id: componentId
        });

        // Now find the specific service interval
        const service = componentModel?.serviceIntervals?.find(e => e.id === componentServiceId);
        if (!service) {
            return null;
        }

        service = serviceIntervalDto;
        await componentModel.save();

        return new ServiceIntervalDto(service);
    } catch (error) {
        console.log('Error updating component service interval', error);
        return null;
    }
};

/**
 * Removes a specific service interval from a component.
 * 
 * @param userId            The id of the current user
 * @param componentId       The Id of the component
 * @param componentServiceId  The Id of the service interval
 * 
 * @returns {Promise<ServiceIntervalDto>} Returns an object containing the service interval removed
 **/
const removeComponentService = async function(userId, componentId, componentServiceId) {
    try {
        const componentModel = await ComponentModel.findOneAndUpdate({
            userId: userId,
            _id: componentId
        }, { 
            $pull: { serviceIntervals: {id : componentServiceId} } 
        }, {
            new: true
        });

        // Return the service interval
        const service = componentModel?.serviceIntervals?.find(e => e.id === componentServiceId);
        return !service ? null : new ServiceIntervalDto(service);
    } catch (error) {
        console.log('Error removing component service interval', error);
        return null;
    }
};


module.exports = {
    ComponentDto,
    ServiceIntervalDto,

    getComponentsForUser,
    getComponentById,
    deleteComponent,
    updateComponent,
    createComponent,

    synchronizeComponentRides,

    addComponentService,
    getComponentService,
    updateComponentService,
    removeComponentService,
}