const express = require("express");
const RideController = require('../controllers/ride');
const { isAuthenticated } = require('../middleware/authenticated');

const router = express.Router();

/**
 * @swagger
 * 
 * /ride/statistics:
 *   get:
 *     summary: Get Ride Statistics
 *     description: Retrieves statistics for user's rides
 *     tags:
 *     - Rides
 *   produces:
 *      - application/json
 *   responses:
 *      200:
 *        description: A list of components
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                totalRides:
 *                  type: number
 *                  description: The total number of rides taken
 *                totalDistance:
 *                  type: number
 *                  description: The total distance in meters traveled
 *                totalTime:
 *                  type: number
 *                  description: The total duration in seconds of riding time
 * 
 *      401:
 *        description: Unauthorized
 * 
 */
router.get('/ride/statistics', isAuthenticated, async (req, res) => {
    const stats = await RideController.getAthleteStats(req.user.userId);
    res.send(stats);
});

module.exports = router;