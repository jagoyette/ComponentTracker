const express = require("express");
const BikeController = require('../controllers/bike');
const { isAuthenticated } = require('../middleware/authenticated');

const router = express.Router();


/**
 * Swagger Model Schema Definitions for Components and dependents
 * 
 * @swagger
 * components:
 *   schemas:
 *     Bike:
 *       description: A bicyle
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique Id assigned to this bike
 *         userId:
 *           type: string
 *           description: The Id of the user that owns this bike
 *         gearId:
 *           type: string
 *           description: Third party Id for bike
 *         name:
 *           type: string
 *           description: A name for the bike
 *         description:
 *           type: string
 *           description: Description of the bike
 *         manufacturer:
 *           type: string
 *           description: The bike Manufacturer
 *         model:
 *           type: string
 *           description: Manufacturer's Model name
 *         default:
 *           type: boolean
 *           description: True is this is the user's default bike
 *
 */

/**
 * @swagger 
 * 
 * /bike/:
 *  get:
 *    summary: Get All Bikes
 *    description: Retrieves all bikes for the current user
 *    tags:
 *    - Bikes
 *    produces:
 *      - application/json
 *    responses:
 *      200:
 *        description: A list of bikes
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/Bike'
 *      401:
 *        description: Unauthorized
 *  
 */
router.get('/bike/', isAuthenticated, async (req, res) => {
    const userId = req.user.userId;
    const components = await BikeController.getBikesForUser(userId);
    res.send(components);
});

/**
 * @swagger
 * 
 * /bike/:
 *  post:
 *    summary: Create a bike
 *    description: Creates a new bike
 *    tags:
 *    - Bikes
 *    requestBody:
 *      description: The bike to create
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              name:
 *                type: string
 *                description: A name for the bike
 *              description:
 *                type: string
 *                description: Description of the bike
 *              manufacturer:
 *                type: string
 *                description: The bike Manufacturer
 *              model:
 *                type: string
 *                description: Manufacturer's Model name
 *              gearId:
 *                type: string
 *                description: Optional third party Id of bike
 *              default:
 *                type: boolean
 *                description: Flag indicating if this is the user's default bike
 *    produces:
 *      - application/json
 *    responses:
 *      200:
 *        description: The newly created bike
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Bike'
 *      401:
 *        description: Unauthorized
 *  
 */
router.post('/bike/', isAuthenticated, async (req, res) => {
    const userId = req.user.userId;
    const bikeData = new BikeController.BikeDto(req.body);

    // add user Id to request
    bikeData.userId = userId;
    const bike = await BikeController.createBike(userId, bikeData);
    res.send(bike);
});


/**
 * @swagger
 * 
 * /bike/{bikeId}:
 *  get:
 *    summary: Get a bike
 *    description: Retrieve details of a specific bike
 *    tags:
 *    - Bikes
 *    parameters:
 *      - in: path
 *        name: bikeId
 *        schema:
 *          type: string
 *        required: true
 *        description: The Id of the bike to retrieve
 *    produces:
 *      - application/json
 *    responses:
 *      200:
 *        description: The bike details
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Bike'
 *      401:
 *        description: Unauthorized
 *      404:
 *        description: The bike Id was not found
 *
 */
router.get('/bike/:bikeId', isAuthenticated, async (req, res) => {
    const userId = req.user.userId;
    const bikeId = req.params.bikeId;
    const bike = await BikeController.getBikeById(userId, bikeId);
    if (!bike) {
        res.status(404).send({
            error: {
                status: 'Not Found',
                message: 'No bike with Id: ' + bikeId + ' was found.'
            }
        });
    } else {
        res.send(bike);
    }
});

/**
 * @swagger
 * 
 * /bike/{bikeId}:
 *  put:
 *    summary: Update a bike
 *    description: Update a specific bike
 *    tags:
 *    - Bikes
 *    parameters:
 *      - in: path
 *        name: bikeId
 *        schema:
 *          type: string
 *        required: true
 *        description: The Id of the bike to update
 *    requestBody:
 *      description: The bike to create
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              name:
 *                type: string
 *                description: A name for the bike
 *              description:
 *                type: string
 *                description: Description of the bike
 *              manufacturer:
 *                type: string
 *                description: The bike Manufacturer
 *              model:
 *                type: string
 *                description: Manufacturer's Model name
 *              gearId:
 *                type: string
 *                description: Optional third party Id of bike
 *              default:
 *                type: boolean
 *                description: Flag indicating if this is the user's default bike
 *    produces:
 *      - application/json
 *    responses:
 *      200:
 *        description: The bike details
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Bike'
 *      401:
 *        description: Unauthorized
 *      404:
 *        description: The bike Id was not found
 *
 */
router.put('/bike/:bikeId', isAuthenticated, async (req, res) => {
    const userId = req.user.userId;
    const bikeId = req.params.bikeId;
    const bikeModel = new BikeController.BikeDto(req.body);
    const bike = await BikeController.updateBike(userId, bikeId, bikeModel);
    if (!bike) {
        res.status(404).send({
            error: {
                status: 'Not Found',
                message: 'No bike with Id: ' + bikeId + ' was found.'
            }
        });
    } else {
        res.send(bike);
    }
});

/**
 * @swagger
 * 
 * /bike/{bikeId}:
 *  delete:
 *    summary: Delete a bike
 *    description: Delete a specific bike
 *    tags:
 *    - Bikes
 *    parameters:
 *      - in: path
 *        name: bikeId
 *        schema:
 *          type: string
 *        required: true
 *        description: The Id of the bike to delete
 *    produces:
 *      - application/json
 *    responses:
 *      200:
 *        description: The bike that was deleted
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Bike'
 *      401:
 *        description: Unauthorized
 *      404:
 *        description: The bike Id was not found
 *
 */
router.delete('/bike/:bikeId', isAuthenticated, async (req, res) => {
    const userId = req.user.userId;
    const bikeId = req.params.bikeId;
    const bike = await BikeController.deleteBike(userId, bikeId);
    if (!bike) {
        res.status(404).send({
            error: {
                status: 'Not Found',
                message: 'No bike with Id: ' + bikeId + ' was found.'
            }
        });
    } else {
        res.send(bike);
    }
});

module.exports =router;