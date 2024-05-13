const express = require("express");
const StravaController = require('../controllers/stravaAthlete');
const StravaTokenController = require('../controllers/stravaToken');
const { isAuthenticated } = require('../middleware/authenticated');
const ComponentController = require('../controllers/component');

const router = express.Router();

// Retrieve info about Strava athlete
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

// Delete Strava Integration
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
