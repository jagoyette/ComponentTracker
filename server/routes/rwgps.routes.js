const express = require("express");
const RwgpsController = require('../controllers/rwgpsAthlete');
const { isAuthenticated } = require('../middleware/authenticated');
const ComponentController = require('../controllers/component');

const router = express.Router();

/**
 * @swagger
 * 
 * /rwgps/athlete:
 *    get:
 *     summary: Get RWGPS Athlete
 *     description: Get's the user's Ride With GPS athlete profile
 *     tags:
 *     - RWGPS
 *    produces:
 *      - application/json
 *    responses:
 *      200:
 *        description: A RWGPS Athlete
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                userId:
 *                  type: string
 *                  description: The user Id this athlete profile belongs to
 *                id:
 *                  type: string
 *                  description: The athlete's user Id in RWGPS
 *                firstName:
 *                  type: string
 *                  description: Athlete's first name
 *                lastName:
 *                  type: string
 *                  description: Athlete's last name
 *                description:
 *                  type: string
 *                  description: Athlete's profile description
 *                interests:
 *                  type: string
 *                  description: Athlete's interests
 *                locality:
 *                  type: string
 *                  description: Athlete's locality (city)
 *                state:
 *                  type: string
 *                  description: Athlete's state
 *                country:
 *                  type: string
 *                  description: Athlete's country
 *                name:
 *                  type: string
 *                  description: Athlete's name 
 *                age:
 *                  type: number
 *                  description: Athlete's age 
 *                createdAt:
 *                  type: string
 *                  format: date
 *                  description: Date profile was created
 *                updatedAt:
 *                  type: string
 *                  format: date
 *                  description: Date profile was last updated
 *      404:
 *        description: RWGPS Athlete Not Found
 *      401:
 *        description: Unauthorized
 * 
 */
router.get('/rwgps/athlete', isAuthenticated, async (req, res) => {
    const userId = req.user.userId;
    const athlete = await RwgpsController.getAthleteByUserId(userId);
    if (!athlete) {
        res.status(404).send({
            error: {
                status: 'Not Found',
                message: 'User does not have a RWGPS integration'
            }
        });
    } else {
        res.send(athlete);
    }
});

/**
 * @swagger
 * 
 * /rwgps/athlete:
 *    delete:
 *     summary: Delete RWGPS Athlete
 *     description: Delete's (Unauthorizes) the connection to Ride with GPS for the current user.
 *     tags:
 *     - RWGPS
 *    produces:
 *      - application/json
 *    responses:
 *      200:
 *        description: A RWGPS Athlete
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                status:
 *                  type: string
 *                  description: Status result is `Success` or `Error`
 * 
 *      401:
 *        description: Unauthorized
 * 
 */
router.delete('/rwgps/athlete', isAuthenticated, async (req, res) => {
    const userId = req.user.userId;

    try {
        // delete athlete
        await RwgpsController.deleteAthlete(userId);

        // return success
        res.send({
            status: 'Success'
        });
    } catch (error) {
        console.log('Error deleting athlete', error);
        res.send({
            status: 'Error',
            error: error
        });
    }
});

/**
 * @swagger
 * 
 * /rwgps/synchronize:
 *    post:
 *     summary: Synchronize RWGPS Rides
 *     description: Retrieves all RWGPS rides for athlete and synchronizes with user rides
 *     tags:
 *     - RWGPS
 *    produces:
 *      - application/json
 *    responses:
 *      200:
 *        description: Background synchronization has started
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                result:
 *                  type: string
 *                  description: Message indicating sync started
 *      404:
 *        description: RWGPS Athlete Not Found      
 *      401:
 *        description: Unauthorized
 * 
 */
router.post('/rwgps/synchronize', isAuthenticated, async (req, res) => {
    // First make sure we have a valid Strava user
    const userId = req.user.userId;
    const athlete = await RwgpsController.getAthleteByUserId(userId);
    if (!athlete) {
        res.status(404).send({
            error: {
                status: 'Not Found',
                message: 'User does not have a RWGPS integration'
            }
        });
        return;
    }

    // Here we simply launch an async process to start synchronizing strava rides
    // We do not wait for completion
    RwgpsController.synchronizeRides(userId).then(
        async (numRides) => {
            console.log('Syncronized ' + numRides + ' rides. Updating components...');
            const components = await ComponentController.getComponentsForUser(userId);
            if (components?.length > 0) {
                for (let index = 0; index < components.length; index++) {
                    const component = components[index];
                    const updatedComp = await ComponentController.synchronizeComponentRides(userId, component.id);
                }
            }
            console.log('Finished updating components.');
        },
        reason => {
            console.log('Synchronize rides failed with reason: ' + reason);
        }
    );
    res.send({
        result: 'Sync started'
    });
});

// export the router
module.exports = router;
