const express = require("express");
const RideController = require('../controllers/ride');
const { isAuthenticated } = require('../middleware/authenticated');

const router = express.Router();

/**
 * Swagger Model Schema for Rides
 * 
 * @swagger
 * components:
 *   schemas:
 *     Ride:
 *       description: A user ride
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique Id asigned to this ride
 *         userId:
 *           type: string
 *           description: The Id of the user that owns this ride
 *         rideId:
 *           type: string
 *           description: An external reference Id, typically representing the Id from a ride imported from a provider
 *         externalId:
 *           type: string
 *           description: An external reference Id, often used by the provider to indicate an imported ride
 *         athleteId:
 *           type: string
 *           description: An Id representing the user of the third party provider
 *         provider:
 *           type: string
 *           description: A string representing the third party provider, i.e., "Strava"
 *         title:
 *           type: string
 *           description: A title for the ride
 *         description:
 *           type: string
 *           description: A short summary or description of the ride
 *         distance:
 *           type: number
 *           description: The total ride distance in meters
 *         movingTime:
 *           type: number
 *           description: The total duration (moving time) of the ride in seconds
 *         gearId:
 *           type: string
 *           description: An Id from the third party provider representing the gear or bike used for the ride
 *         type:
 *           type: string
 *           description: Indicates the type of activity, i.e., "Ride"
 *         sportType:
 *           type: string
 *           description: A sub category for the ride type
 *         startDate:
 *           type: string
 *           format: date-time
 *           description: The timestamp of the start of the ride
 *         commute:
 *           type: boolean
 *           description: Flag indicating if the ride was a commute
 *         trainer:
 *           type: boolean
 *           description: Flag indicating if the ride was on a stationary trainer
 * 
 */


/**
 * @swagger
 * 
 * /ride:
 *   get:
 *     summary: Get Rides
 *     description: Retrieves a list of rides for the current user
 *     tags:
 *     - Rides
 *     produces:
 *        - application/json
 *     responses:
 *        200:
 *          description: A list of rides
 *          content:
 *            application/json:
 *              schema:
 *                type: array
 *                items:
 *                  $ref: '#/components/schemas/Ride'
 *        401:
 *          description: Unauthorized
 *        404:
 *          description: Not Found 
 */
router.get('/ride', isAuthenticated, async (req, res) => {
    const rides = await RideController.getAthleteRides(req.user.userId);
    if (!rides) {
        res.status(404).send({
            error: {
                status: 'Not Found',
                message: 'No rides found.'
            }
        });
    }
    res.send(rides);
});

/**
 * @swagger
 * 
 * /ride/statistics:
 *   get:
 *     summary: Get Ride Statistics
 *     description: Retrieves statistics for user's rides
 *     tags:
 *     - Rides
 *     produces:
 *        - application/json
 *     responses:
 *        200:
 *          description: Ride statistics
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  totalRides:
 *                    type: number
 *                    description: The total number of rides taken
 *                  totalDistance:
 *                    type: number
 *                    description: The total distance in meters traveled
 *                  totalTime:
 *                    type: number
 *                    description: The total duration in seconds of riding time
 *        401:
 *          description: Unauthorized
 * 
 */
router.get('/ride/statistics', isAuthenticated, async (req, res) => {
    const stats = await RideController.getAthleteStats(req.user.userId);
    res.send(stats);
});

/**
 * @swagger
 * 
 * /ride/{id}:
 *   get:
 *     summary: Get a Ride
 *     description: Retrieves a specific ride
 *     tags:
 *     - Rides
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The Id of the ride to retrieve
 *     produces:
 *        - application/json
 *     responses:
 *        200:
 *          description: A ride
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Ride'
 *        401:
 *          description: Unauthorized
 *        404:
 *          description: Not Found
 */
router.get('/ride/:id', isAuthenticated, async (req, res) => {
    const id = req.params.id;
    const ride = await RideController.getAthleteRide(req.user.userId, id);
    if (!ride) {
        res.status(404).send({
            error: {
                status: 'Not Found',
                message: 'Ride with Id: ' + id + ' not found.'
            }
        });
    } else {
        res.send(ride);
    }
});

/**
 * @swagger
 * 
 * /ride/component/{componentId}:
 *   get:
 *     summary: Get Component Rides
 *     description: Retrieves a list of rides for the given component
 *     tags:
 *     - Rides
 *     parameters:
 *       - in: path
 *         name: componentId
 *         schema:
 *           type: string
 *         required: true
 *         description: The Id of the component
 *     produces:
 *        - application/json
 *     responses:
 *        200:
 *          description: A list of rides
 *          content:
 *            application/json:
 *              schema:
 *                type: array
 *                items:
 *                  $ref: '#/components/schemas/Ride'
 *        401:
 *          description: Unauthorized
 *        404:
 *          description: Not Found
 */
router.get('/ride/component/:componentId', isAuthenticated, async (req, res) => {
    const componentId = req.params.id;
    const rides = await RideController.getComponentRides(req.user.userId, componentId);
    if (!rides) {
        res.status(404).send({
            error: {
                status: 'Not Found',
                message: 'Rides for Component: ' + componentId + ' not found.'
            }
        });
    } else {
        res.send(rides);
    }
});


module.exports = router;