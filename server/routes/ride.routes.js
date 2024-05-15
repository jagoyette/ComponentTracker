const express = require("express");
const RideController = require('../controllers/ride');
const { isAuthenticated } = require('../middleware/authenticated');

const router = express.Router();

router.get('/statistics', isAuthenticated, async (req, res) => {
    const stats = await RideController.getAthleteStats(req.user.userId);
    res.send(stats);
});

module.exports = router;