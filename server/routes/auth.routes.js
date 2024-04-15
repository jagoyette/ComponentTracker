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
// This route will redirect the user to authorize access using
// their Google account. The route is intended to be displayed
// by a browser (instead of a background fetch api). Upon 
// completion, the user is redirected once to the callback
// below. From the callback, the user is redirected to the
// apps success or failure url depending on user authorization.
router.get('/google/login', (req, res, next) => {
    // extract redirects and place into passport's state
    let { successRedirect, failureRedirect } = req.query;

    // Make sure redirects have sane defaults
    successRedirect = successRedirect || '/';
    failureRedirect = failureRedirect || '/google/login';
    console.log(`Starting Google login with redirects => success: ${successRedirect}, failure: ${failureRedirect}`);
    
    // Initiate OAuth2 authentication flow
    const state = JSON.stringify({ successRedirect, failureRedirect });
    passport.authenticate('google', { 
        scope: [ 'email', 'profile' ],
        state: state
    })(req, res, next);
});

// Google Authentication callback - always called from above
// login route. Use passport to determine results and redirect
// user appropriately
router.get('/google/callback', (req, res, next) => {
    try {
        console.log('Google callback entered...');

        // initialize defaults for redirects
        let successRedirect = '/';
        let failureRedirect = '/google/login';

        // extract the redirects from state and use it if we have it
        const { state } = req.query;
        if (state) {
            // Parse the string to get our object containing urls
            const redirectUrls = JSON.parse(state);
            if (redirectUrls?.successRedirect) {
                successRedirect = redirectUrls.successRedirect;
            }
            if (redirectUrls?.failureRedirect) {
                failureRedirect = redirectUrls.failureRedirect;
            }         
        }

        // Let passport authenticate and redirect
        passport.authenticate('google', {
            successRedirect,
            failureRedirect
        })(req, res, next);

    } catch (err) {
        console.error(err);
    }
});

router.get('/strava/integrate',
    passport.authenticate('strava', {
        scope: ['activity:read_all'],
        session: false
    })
);

// strava callback url
router.get('/strava/callback',
    passport.authenticate('strava', {
        failureRedirect: '../stava/failure',        
    }), 
    (req, res) => {
        res.redirect('/');
    }
);

// export the router
module.exports = router;