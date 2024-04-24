const express = require("express");
const StravaController = require('../controllers/stravaAthlete');
const { isAuthenticated } = require('../middleware/authenticated');

const router = express.Router();

router.get('/athlete', isAuthenticated, async (req, res) => {
    const athlete = await StravaController.getAthleteByUserId(req.user.userId);
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

router.get('/statistics', isAuthenticated, async (req, res) => {
    const stats = await StravaController.getAthleteStats(req.user.userId);
    res.send(stats);
});

router.post('/synchronize', isAuthenticated, async (req, res) => {
    // First make sure we have a valid Strava user
    const athlete = await StravaController.getAthleteByUserId(req.user.userId);
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
    StravaController.synchronizeRides(req.user.userId);
    res.send({
        result: 'Sync started',
        currentStats: await StravaController.getAthleteStats(req.user.userId)
    });
});

// export the router
module.exports = router;
