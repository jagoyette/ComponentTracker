const express = require("express");
const passport = require("passport");
const UserController = require('../controllers/user');

const router = express.Router();

// Logout user
router.post('/logout', function (req, res, next) {
    req.logOut(function (err) {
        if (err) { return next(err); }
        res.send({
            success: true,
            message: "User logged out"
        });
    });
});

// Returns current user if logged in
router.get('/user', 
    async (req, res) => {
        // extract provider and id from our current user
        const id = req.user?.id;
        const provider = req.user?.provider;
        const user = await UserController.getUserByProviderId(provider, id);
        res.send(user);
    }
);

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
    try {
        // Build redirect urls for the success and failure cases
        let redirectUrl = '/';

        // extract the returnTo param from state and use it if we have it
        const { state } = req.query;
        if (state) {
            const { returnTo } = JSON.parse(state);
            if (typeof returnTo === 'string') {
                redirectUrl = returnTo;
            }
        }

        // Check if we are appending params or starting new params
        let appendSeparator = '?';
        if (redirectUrl.includes('?')) {
            appendSeparator = '&';
        }

        // Let passport authenticate and redirect
        passport.authenticate('google', {
            successRedirect: redirectUrl + appendSeparator + 'success=true',
            failureRedirect: redirectUrl + appendSeparator + 'success=false'
        })(req, res, next);
    } catch (err) {
        console.error(err);
    }
});

// export the router
module.exports = router;