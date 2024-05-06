const express = require("express");
const ComponentController = require('../controllers/component');
const { isAuthenticated } = require('../middleware/authenticated');

const router = express.Router();

// Get all components for user
router.get('/', isAuthenticated, async (req, res) => {
    const userId = req.user.userId;
    const components = await ComponentController.getComponentsForUser(userId);
    res.send(components);
});

// Create a component
router.post('/', isAuthenticated, async (req, res) => {
    const userId = req.user.userId;
    const componentData = new ComponentController.ComponentDto(req.body);

    // add user Id to request
    componentData.userId = userId;
    const component = await ComponentController.createComponent(userId, componentData);
    res.send(component);
});

// Get a component
router.get('/:componentId', isAuthenticated, async (req, res) => {
    const userId = req.user.userId;
    const componentId = req.params.componentId;
    const component = await ComponentController.getComponentById(userId, componentId);
    if (!component) {
        res.status(404).send({
            error: {
                status: 'Not Found',
                message: 'No component with Id: ' + componentId + ' was found.'
            }
        });
    } else {
        res.send(component);
    }
});

// Delete a component
router.delete('/:componentId', isAuthenticated, async (req, res) => {
    const userId = req.user.userId;
    const componentId = req.params.componentId;
    const component = await ComponentController.deleteComponent(userId, componentId);
    if (!component) {
        res.status(404).send({
            error: {
                status: 'Not Found',
                message: 'No component with Id: ' + componentId + ' was found.'
            }
        });
    } else {
        res.send(component);
    }
});

// Update a component
router.put('/:componentId', isAuthenticated, async (req, res) => {
    const userId = req.user.userId;
    const componentId = req.params.componentId;
    const componentModel = new ComponentController.ComponentDto(req.body);
    const component = await ComponentController.updateComponent(userId, componentId, componentModel);
    if (!component) {
        res.status(404).send({
            error: {
                status: 'Not Found',
                message: 'No component with Id: ' + componentId + ' was found.'
            }
        });
    } else {
        res.send(component);
    }
});

// Add an event to a component
router.post('/:componentId/event', isAuthenticated, async (req, res) => {
    const userId = req.user.userId;
    const { componentId } = req.params;
    const componentEvent = new ComponentController.ComponentEventDto(req.body);

    const event = await ComponentController.addComponentEvent(userId, componentId, componentEvent);
    if (!event) {
        res.status(404).send({
            error: {
                status: 'Not Found',
                message: 'No component with Id: ' + componentId + ' was found.'
            }
        });        
    } else {
        res.send(event);
    }
});

// Retrieves an event from component
router.get('/:componentId/event/:componentEventId', isAuthenticated, async (req, res) => {
    const userId = req.user.userId;
    const { componentId, componentEventId } = req.params;

    const event = await ComponentController.getComponentEvent(userId, componentId, componentEventId);
    if (!event) {
        res.status(404).send({
            error: {
                status: 'Not Found',
                message: 'No component event with Id: ' + componentEventId + ' was found.'
            }
        });        
    } else {
        res.send(event);
    }
});

// Updates an event from component
router.put('/:componentId/event/:componentEventId', isAuthenticated, async (req, res) => {
    const userId = req.user.userId;
    const { componentId, componentEventId } = req.params;
    const eventDto = new ComponentController.ComponentEventDto(req.body);

    const event = await ComponentController.updateComponentEvent(userId, componentId, componentEventId, eventDto);
    if (!event) {
        res.status(404).send({
            error: {
                status: 'Not Found',
                message: 'No component event with Id: ' + componentEventId + ' was found.'
            }
        });        
    } else {
        res.send(event);
    }
});

// Remove an event from component
router.delete('/:componentId/event/:componentEventId', isAuthenticated, async (req, res) => {
    const userId = req.user.userId;
    const { componentId, componentEventId } = req.params;

    const event = await ComponentController.removeComponentEvent(userId, componentId, componentEventId);
    if (!event) {
        res.status(404).send({
            error: {
                status: 'Not Found',
                message: 'No component event with Id: ' + componentEventId + ' was found.'
            }
        });        
    } else {
        res.send(event);
    }
});

// Synchronize component with rides
router.post('/:componentId/sync', isAuthenticated, async (req, res) => {
    const userId = req.user.userId;
    const { componentId } = req.params;
    
    const component = await ComponentController.synchronizeComponentRides(userId, componentId);
    if (!component) {
        res.status(404).send({
            error: {
                status: 'Not Found',
                message: 'No component with Id: ' + componentId + ' was found.'
            }
        });
    } else {
        res.send(component);
    }
});

module.exports = router;