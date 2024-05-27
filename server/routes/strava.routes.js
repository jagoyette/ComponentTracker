const express = require("express");
const StravaController = require('../controllers/stravaAthlete');
const StravaTokenController = require('../controllers/stravaToken');
const { isAuthenticated } = require('../middleware/authenticated');
const ComponentController = require('../controllers/component');

const router = express.Router();

/**
 * @swagger
 * 
 * /strava/athlete:
 *    get:
 *     summary: Get Strava Athlete
 *     description: Get's the user's Ride With GPS athlete profile
 *     tags:
 *     - Strava
 *    produces:
 *      - application/json
 *    responses:
 *      200:
 *        description: A Strava Athlete
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
 *                  description: The athlete's user Id in Strava
 *                firstName:
 *                  type: string
 *                  description: Athlete's first name
 *                lastName:
 *                  type: string
 *                  description: Athlete's last name
 *                profileMedium:
 *                  type: string
 *                  description: Athlete's profile picture (medium)
 *                profile:
 *                  type: string
 *                  description: Athlete's profile picture
 *                city:
 *                  type: string
 *                  description: Athlete's city
 *                state:
 *                  type: string
 *                  description: Athlete's state
 *                country:
 *                  type: string
 *                  description: Athlete's country
 *                sex:
 *                  type: string
 *                  description: Athlete's sex 
 *                summit:
 *                  type: boolean
 *                  description: True if athlete has subscription (Summit)
 *                createdAt:
 *                  type: string
 *                  format: date
 *                  description: Date profile was created
 *                updatedAt:
 *                  type: string
 *                  format: date
 *                  description: Date profile was last updated
 *      404:
 *        description: Strava Athlete Not Found
 *      401:
 *        description: Unauthorized
 * 
 */
router.get('/athlete', isAuthenticated, async (req, res) => {
    const userId = req.user.userId;
    const athlete = await StravaController.getAthleteByUserId(userId);
    if (!athlete) {
        res.status(404).send({
            error: {
                status: 'Not Found',
                message: 'User does not have a Strava integration'
            }
        });
    } else {
        res.send(athlete);
    }
});

/**
 * @swagger
 * 
 * /stava/athlete:
 *    delete:
 *     summary: Delete Strava Athlete
 *     description: Delete's (Unauthorizes) the connection to Strava for the current user.
 *     tags:
 *     - Strava
 *    produces:
 *      - application/json
 *    responses:
 *      200:
 *        description: A Strava Athlete
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
router.delete('/athlete', isAuthenticated, async (req, res) => {
    const userId = req.user.userId;

    try {
        // delete stored tokens
        await StravaTokenController.deleteToken(userId);
        await StravaController.deleteAthlete(userId);

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
 * /strava/synchronize:
 *    post:
 *     summary: Synchronize Strava Rides
 *     description: Retrieves all Strava rides for athlete and synchronizes with user rides
 *     tags:
 *     - Strava
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
 *        description: Strava Athlete Not Found      
 *      401:
 *        description: Unauthorized
 * 
 */
router.post('/synchronize', isAuthenticated, async (req, res) => {
    // First make sure we have a valid Strava user
    const userId = req.user.userId;
    const athlete = await StravaController.getAthleteByUserId(userId);
    if (!athlete) {
        res.status(404).send({
            error: {
                status: 'Not Found',
                message: 'User does not have a Strava integration'
            }
        });
        return;
    }

    // Here we simply launch an async process to start synchronizing strava rides
    // We do not wait for completion
    StravaController.synchronizeRides(userId).then(
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
