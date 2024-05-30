const express = require("express");
const ComponentController = require('../controllers/component');
const { isAuthenticated } = require('../middleware/authenticated');

const router = express.Router();

/**
 * Swagger Model Schema Definitions for Components and dependents
 * 
 * @swagger
 * components:
 *   schemas:
 *     Component:
 *       description: A bicyle component, such as, a chain, tire, brake pads, etc...
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique Id assigned to this component
 *         userId:
 *           type: string
 *           description: The Id of the user that owns this component
 *         category:
 *           type: string
 *           description: A category for the component use to group similar components. For example, rims, tires and tubes can all be categorized as `wheel`
 *         name:
 *           type: string
 *           description: A name for the component
 *         description:
 *           type: string
 *           description: Description of the component
 *         manufacturer:
 *           type: string
 *           description: The component Manufacturer
 *         model:
 *           type: string
 *           description: Manufacturer's Model name
 *         isInstalled:
 *           type: boolean
 *           description: True is currently installed on a bike
 *         installDate:
 *           type: string
 *           format: date-time
 *           description: The timestamp that the component was installed
 *         uninstallDate:
 *           type: string
 *           format: date-time
 *           description: The timestamp that the component was removed from a bike
 *         serviceIntervals:
 *           description: A list of service intervals affecting this component
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ServiceInterval'
 *         totalRides:
 *           type: number
 *           description: The total number of rides this component has accumulated
 *         totalDistance:
 *           type: number
 *           description: The total distance in meters this component has accumulated
 *         totalTime:
 *           type: number
 *           description: The total time in seconds this component has accumulated
 * 
 *     ServiceInterval:
 *       description: Describes a service interval for a bike or component. For example, a "Maximum Life" service interval may be triggered when a component life reaches a certain distance or usage time.
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique Id for this service interval
 *         name:
 *           type: string
 *           description: The name of this service interval
 *         description:
 *           type: string
 *           description: Description of the service interval
 *         rides:
 *           type: number
 *           description: The number of rides indicating when the service interval is due
 *         distance:
 *           type: number
 *           description: The distance in meters indicating when service interval is due
 *         time:
 *           type: number
 *           description: The duration in seconds indicating when service interval is due
 * 
 * 
*/

/**
 * @swagger
 * 
 * /component/:
 *  get:
 *    summary: Get All Components
 *    description: Retrieves all components for the current user
 *    tags:
 *    - Components
 *    produces:
 *      - application/json
 *    responses:
 *      200:
 *        description: A list of components
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/Component'
 *      401:
 *        description: Unauthorized
 *  
 */
router.get('/component/', isAuthenticated, async (req, res) => {
    const userId = req.user.userId;
    const components = await ComponentController.getComponentsForUser(userId);
    res.send(components);
});


/**
 * @swagger
 * 
 * /component/:
 *  post:
 *    summary: Create a component
 *    description: Creates a new component
 *    tags:
 *    - Components
 *    requestBody:
 *      description: The component to create
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              category:
 *                type: string
 *                description: A category for the component use to group similar components. For example, rims, tires and tubes can all be categorized as `wheel`
 *              name:
 *                type: string
 *                description: A name for the component
 *              description:
 *                type: string
 *                description: Description of the component
 *              manufacturer:
 *                type: string
 *                description: The component Manufacturer
 *              model:
 *                type: string
 *                description: Manufacturer's Model name
 *              installDate:
 *                type: string
 *                format: date-time
 *                description: The timestamp that the component was installed
 *              uninstallDate:
 *                type: string
 *                format: date-time
 *                description: The timestamp that the component was removed from a bike
 *    produces:
 *      - application/json
 *    responses:
 *      200:
 *        description: The newly created component
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Component'
 *      401:
 *        description: Unauthorized
 *  
 */
router.post('/component/', isAuthenticated, async (req, res) => {
    const userId = req.user.userId;
    const componentData = new ComponentController.ComponentDto(req.body);

    // add user Id to request
    componentData.userId = userId;
    const component = await ComponentController.createComponent(userId, componentData);
    res.send(component);
});

/**
 * @swagger
 * 
 * /component/{componentId}:
 *  get:
 *    summary: Get a component
 *    description: Retrieve details of a specific component
 *    tags:
 *    - Components
 *    parameters:
 *      - in: path
 *        name: componentId
 *        schema:
 *          type: string
 *        required: true
 *        description: The Id of the component to retrieve
 *    produces:
 *      - application/json
 *    responses:
 *      200:
 *        description: The component details
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Component'
 *      401:
 *        description: Unauthorized
 *      404:
 *        description: The component Id was not found
 *
 */
router.get('/component/:componentId', isAuthenticated, async (req, res) => {
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

/**
 * @swagger
 * 
 * /component/{componentId}:
 *  put:
 *    summary: Update a component
 *    description: Update a specific component
 *    tags:
 *    - Components
 *    parameters:
 *      - in: path
 *        name: componentId
 *        schema:
 *          type: string
 *        required: true
 *        description: The Id of the component to update
 *    requestBody:
 *      description: The component to create
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              category:
 *                type: string
 *                description: A category for the component use to group similar components. For example, rims, tires and tubes can all be categorized as `wheel`
 *              name:
 *                type: string
 *                description: A name for the component
 *              description:
 *                type: string
 *                description: Description of the component
 *              manufacturer:
 *                type: string
 *                description: The component Manufacturer
 *              model:
 *                type: string
 *                description: Manufacturer's Model name
 *              installDate:
 *                type: string
 *                format: date-time
 *                description: The timestamp that the component was installed
 *              uninstallDate:
 *                type: string
 *                format: date-time
 *                description: The timestamp that the component was removed from a bike
 *    produces:
 *      - application/json
 *    responses:
 *      200:
 *        description: The component details
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Component'
 *      401:
 *        description: Unauthorized
 *      404:
 *        description: The component Id was not found
 *
 */
router.put('/component/:componentId', isAuthenticated, async (req, res) => {
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

/**
 * @swagger
 * 
 * /component/{componentId}:
 *  delete:
 *    summary: Delete a component
 *    description: Delete a specific component
 *    tags:
 *    - Components
 *    parameters:
 *      - in: path
 *        name: componentId
 *        schema:
 *          type: string
 *        required: true
 *        description: The Id of the component to delete
 *    produces:
 *      - application/json
 *    responses:
 *      200:
 *        description: The component that was deleted
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Component'
 *      401:
 *        description: Unauthorized
 *      404:
 *        description: The component Id was not found
 *
 */
router.delete('/component/:componentId', isAuthenticated, async (req, res) => {
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

/**
 * @swagger
 * 
 * /component/{componentId}/sync:
 *  post:
 *    summary: Synchronize a component
 *    description: Updates the component's statistics based on current rides
 *    tags:
 *    - Components
 *    parameters:
 *      - in: path
 *        name: componentId
 *        schema:
 *          type: string
 *        required: true
 *        description: The Id of the component to synchronize
 *    produces:
 *      - application/json
 *    responses:
 *      200:
 *        description: The component details after synchronizing
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Component'
 *      401:
 *        description: Unauthorized
 *      404:
 *        description: The component Id was not found
 *
 */
router.post('/component/:componentId/sync', isAuthenticated, async (req, res) => {
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

/**
 * @swagger
 * 
 * /component/{componentId}/service:
 *  post:
 *    summary: Add a Service Interval to a component
 *    description: Adds a new service interval to the component's `serviceIntervals`.
 *    tags:
 *    - Components
 *    parameters:
 *      - in: path
 *        name: componentId
 *        schema:
 *          type: string
 *        required: true
 *        description: The Id of the component
 *    requestBody:
 *      description: The service interval to create
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              name:
 *                type: string
 *                description: The name of the service interval
 *              distance:
 *                type: number
 *                description: The distance in meters associated with the service interval
 *              time:
 *                type: number
 *                description: The duration in seconds associated with the service interval
 *              rides:
 *                type: number
 *                description: The number of rides associated with the service interval
 *              description:
 *                type: string
 *                description: Description of the service interval
 *    produces:
 *      - application/json
 *    responses:
 *      200:
 *        description: The newly added service interval
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/ServiceInterval'
 *      401:
 *        description: Unauthorized
 *  
 */
router.post('/component/:componentId/service', isAuthenticated, async (req, res) => {
    const userId = req.user.userId;
    const { componentId } = req.params;
    const componentService = new ComponentController.ServiceIntervalDto(req.body);

    const service = await ComponentController.addComponentService(userId, componentId, componentService);
    if (!service) {
        res.status(404).send({
            error: {
                status: 'Not Found',
                message: 'No component with Id: ' + componentId + ' was found.'
            }
        });        
    } else {
        res.send(service);
    }
});

/**
 * @swagger
 * 
 * /component/{componentId}/service/{serviceIntervalId}:
 *  get:
 *    summary: Get a Component's Service Interval
 *    description: Retrieves a specific service interval
 *    tags:
 *    - Components
 *    parameters:
 *      - in: path
 *        name: componentId
 *        schema:
 *          type: string
 *        required: true
 *        description: The Id of the component
 *      - in: path
 *        name: serviceIntervalId
 *        schema:
 *          type: string
 *        required: true
 *        description: The Id of the service interval
 *    produces:
 *      - application/json
 *    responses:
 *      200:
 *        description: The service interval
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/ServiceInterval'
 *      401:
 *        description: Unauthorized
 *  
 */
router.get('/component/:componentId/service/:componentServiceId', isAuthenticated, async (req, res) => {
    const userId = req.user.userId;
    const { componentId, componentServiceId } = req.params;

    const service = await ComponentController.getComponentService(userId, componentId, componentServiceId);
    if (!service) {
        res.status(404).send({
            error: {
                status: 'Not Found',
                message: 'No component service interval with Id: ' + componentServiceId + ' was found.'
            }
        });        
    } else {
        res.send(service);
    }
});

/**
 * @swagger
 * 
 * /component/{componentId}/service/{serviceIntervalId}:
 *  post:
 *    summary: Update a Component's Service Interval
 *    description: Updates a service interval for component.
 *    tags:
 *    - Components
 *    parameters:
 *      - in: path
 *        name: componentId
 *        schema:
 *          type: string
 *        required: true
 *        description: The Id of the component
 *      - in: path
 *        name: serviceIntervalId
 *        schema:
 *          type: string
 *        required: true
 *        description: The Id of the service interval
 *    requestBody:
 *      description: The service interval to update
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              name:
 *                type: string
 *                description: The name of the service interval
 *              distance:
 *                type: number
 *                description: The distance in meters associated with the service interval
 *              time:
 *                type: number
 *                description: The duration in seconds associated with the service interval
 *              rides:
 *                type: number
 *                description: The number of rides associated with the service interval
 *              description:
 *                type: string
 *                description: Description of the service interval
 *    produces:
 *      - application/json
 *    responses:
 *      200:
 *        description: The updated service interval
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/ServiceInterval'
 *      401:
 *        description: Unauthorized
 *  
 */
router.put('/component/:componentId/service/:componentServiceId', isAuthenticated, async (req, res) => {
    const userId = req.user.userId;
    const { componentId, componentServiceId } = req.params;
    const serviceDto = new ComponentController.ServiceIntervalDto(req.body);

    const service = await ComponentController.updateComponentService(userId, componentId, componentServiceId, serviceDto);
    if (!service) {
        res.status(404).send({
            error: {
                status: 'Not Found',
                message: 'No component service interval with Id: ' + componentServiceId + ' was found.'
            }
        });        
    } else {
        res.send(service);
    }
});

/**
 * @swagger
 * 
 * /component/{componentId}/service/{serviceIntervalId}:
 *  delete:
 *    summary: Delete a Component's Service Interval
 *    description: Deletes a specific service interval
 *    tags:
 *    - Components
 *    parameters:
 *      - in: path
 *        name: componentId
 *        schema:
 *          type: string
 *        required: true
 *        description: The Id of the component
 *      - in: path
 *        name: serviceIntervalId
 *        schema:
 *          type: string
 *        required: true
 *        description: The Id of the service interval
 *    produces:
 *      - application/json
 *    responses:
 *      200:
 *        description: The deleted service interval
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/ServiceInterval'
 *      401:
 *        description: Unauthorized
 *  
 */
router.delete('/component/:componentId/service/:componentServiceId', isAuthenticated, async (req, res) => {
    const userId = req.user.userId;
    const { componentId, componentServiceId } = req.params;

    const service = await ComponentController.removeComponentService(userId, componentId, componentServiceId);
    if (!service) {
        res.status(404).send({
            error: {
                status: 'Not Found',
                message: 'No component service interval with Id: ' + componentServiceId + ' was found.'
            }
        });        
    } else {
        res.send(service);
    }
});

module.exports = router;