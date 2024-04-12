const express = require("express");
const passport = require("passport");
const { log } = require("util");

const router = express.Router();

// Logout user
router.get('/logout', function (req, res, next) {
    req.logOut(function (err) {
        if (err) { return next(err); }
        res.send({
            result: "Success",
            message: "User logged out"
        });
    });
});

// Login with Google workflow
router.get('/google/login', (req, res, next) => {
    // extract returnTo url and place into passport's state
    const { returnTo } = req.query;
    const state = returnTo ? JSON.stringify({returnTo}) : undefined;
    passport.authenticate('google', { 
        scope: [ 'email', 'profile' ],
        state: state
    })(req, res, next);
});

// Google Authentication callback
router.get('/google/callback', (req, res, next) => {
    passport.authenticate('google', {
        failureRedirect: '../google/callback/failure'
    })(req, res, next);
}, (req, res) => {
    // If we are here, login was successful
    try {
        // extract the returnTo param from state
        const { state } = req.query;
        if (state) {
            const { returnTo } = JSON.parse(state);
            if (typeof returnTo === 'string') {
                return res.redirect(returnTo)
            }
        }
    } catch (err) {
        console.error(err);
    }
});

// failure - user was not authenticated via Google
router.get('/google/callback/failure', (req , res) => { 
    res.status(401).send({
        error: {
            message: "Google Authentication Error"
        }
    });
});

// export the router
module.exports = router;