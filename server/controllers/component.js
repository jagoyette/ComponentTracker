const ComponentModel = require('../models/component');

// Our DTO (Data Transfer Object)
class ComponentDto {
    constructor(model) {
        this.id = model?.id,
        this.userId = model?.userId;
        this.category = model?.category;
        this.name = model?.name;
        this.description = model?.description;
        this.manufacturer = model?.manufacturer;
        this.model = model?.model;
        this.isActive = model?.isActive;
        this.installDate = model?.installDate;
        this.totalDistance = model?.totalDistance;
        this.totalTime = model?.totalTime;
    }
}

const getComponentById = async function(userId, componentId) {
    try {
        const componentModel = await ComponentModel.findById(componentId).exec();

        // Make sure the user owns this component
        if (componentModel.userId !== userId) {
            console.log('User ' + userId + ' does not own component ' + componentId);
        } else {
            return !componentModel ? null : new ComponentDto(componentModel);
        }
    } catch (error) {
        console.log('Error retrieving component', error);
    }
};

const deleteComponent = async function(userId, componentId) {
    try {
        const result = await ComponentModel.findOneAndDelete({
            userId: userId,
            _id: componentId
        }).exec();
    } catch (error) {
        console.log('Error deleting component', error);
    }
};

const updateComponent = async function(userId, componentId, componentDto) {
    try {
        // look for the component using user and componentid and update it
        const componentModel = await ComponentModel.findOneAndUpdate(
            {
                userId: userId,
                _id: componentId
            },
            componentDto,
            { new: true }).exec();
        return !componentModel ? null : new ComponentDto(componentModel);
    } catch (error) {
        console.log('Error updating component', error);
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
    }
};

const getComponentsForUser = async function(userId) {
    try {
        const models = await ComponentModel.find({userId: userId}).exec();
        if (!models) {
            return null;
        }
        
        // convert to DTOs
        return models.map( m => new ComponentDto(m));

    } catch (error) {
        console.log('Error retrieving components for user', error);
    }
};

module.exports = {
    ComponentDto,
    getComponentById,
    deleteComponent,
    updateComponent,
    createComponent,
    getComponentsForUser
}