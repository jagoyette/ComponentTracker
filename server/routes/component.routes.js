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
    const componentData = req.body;

    // add user Id to request
    componentData.userId = req.user.userId;
    const component = await ComponentController.createComponent(req.user.userId, componentData);
    res.send(component);
});

// Get a component
router.get('/:componentId', isAuthenticated, async (req, res) => {
    const componentId = req.params.componentId;
    const component = await ComponentController.getComponentById(req.user.userId, componentId);
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
    const componentId = req.params.componentId;
    const component = await ComponentController.deleteComponent(req.user.userId, componentId);
    res.send(200);
});

// Update a component
router.put('/:componentId', isAuthenticated, async (req, res) => {
    const userId = req.user.userId;
    const componentId = req.params.componentId;
    const component = await ComponentController.updateComponent(userId, componentId, req.body);
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