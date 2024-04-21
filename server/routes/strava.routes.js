const express = require("express");
const StravaController = require('../controllers/stravaAthlete');

const router = express.Router();

router.post('/synchronize', (req, res) => {
    if (!req.user) {
        res.status(401).send('Unauthenticated');
    }

    StravaController.synchronizeRides(req.user._id).then( v => {
        console.log('done');
    });
    res.send({'result': 'started'});
});

// export the router
module.exports = router;
