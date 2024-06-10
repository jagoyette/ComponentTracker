const express = require("express");
const passport = require("passport");
const axios = require("axios");
const Url = require("url");
const crypto = require("crypto");
const ms = require("ms");

const jwtConfig = require('../configs/jwt');
const Utils = require('../utils/network');
const UserController = require('../controllers/user');

const router = express.Router();

// Retrieves current user info
router.get('/user',
    passport.authenticate('jwt', { session: false }),
    async (req, res) => {
        // extract provider and id from our current user
        const id = req.user?.id;
        const provider = req.user?.provider;
        const user = await UserController.getUserByProviderId(provider, id);
        res.send(user);
    }
);

// method to encode redirect urls into a state object
// Used for OAuth redirect workflows so that application redirects can
// be passed to our callback URL
function encodeStateRedirects(req, defaultSuccess, defaultFailure) {
    let { successRedirect, failureRedirect } = req.query || {};

    // Make sure redirects have sane defaults
    successRedirect = successRedirect || defaultSuccess;
    failureRedirect = failureRedirect || defaultFailure;

    // Return JSON string representing our state
    return JSON.stringify({ successRedirect, failureRedirect });
}

// Decodes the redirect urls from the state object
function decodeStateRedirects(req, defaultSuccess, defaultFailure) {
    // initialize defaults for redirects
    let successRedirect = defaultSuccess;
    let failureRedirect = defaultFailure;

    // extract the redirects from state and use it if we have it
    const { state } = req.query || {};
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

    // return object containing redirect urls
    return { successRedirect, failureRedirect };
}

// Login with Google workflow
// This route will redirect the user to authorize access using
// their Google account. The route is intended to be displayed
// by a browser (instead of a background fetch api). Upon
// completion, the user is redirected once to the callback
// below. From the callback, the user is redirected to the
// apps success or failure url depending on user authorization.
router.get('/google/login', (req, res, next) => {
    // Initiate OAuth2 authentication flow
    passport.authenticate('google', {
        scope: [ 'email', 'profile' ],
        state: encodeStateRedirects(req, '../google/success', '../google/failure')
    })(req, res, next);
});

// Google Authentication callback - always called from above
// login route. Use passport to determine results and redirect
// user appropriately
router.get('/google/callback', (req, res, next) => {
    try {
        const { successRedirect, failureRedirect } = decodeStateRedirects(req, '../google/success', '../google/failure');

        // Let passport authenticate and redirect
        passport.authenticate('google', {
            session: false
        }, (err, user, info) => {
            if (err) {
                return next(err);
            }

            if (!user) {
                res.redirect(failureRedirect);
            } else {
                // Successful login, generate access token
                const expiresInMs = ms('30m');
                const token = jwtConfig.signingFunction(user._id, expiresInMs / 1000.0);
                const refresh_token = jwtConfig.signingFunction(token, '5d', 'refresh');

                // Add the access token to our response as a short lived cookie
                const access_token = {
                    token: token,
                    expires: new Date(Date.now() + expiresInMs),
                    refresh_token: refresh_token
                };
                res.cookie('access_token', JSON.stringify(access_token), {maxAge: 60 * 1000});

                // Resolve the successRedirect Url and redirect response
                res.redirect(new URL(successRedirect, Utils.originalURL(req, {proxy: true})));
            }
        })(req, res, next);
    } catch (err) {
        console.error(err);
        return next(err);
    }
});

router.get('/google/success', (req, res) => {
    console.error('Google login success');
    try {
        const access_token = JSON.parse(req.cookies['access_token']);
        res.cookie('access_token', '', {maxAge: 0});        // delete cookie
        res.send(access_token);
    } catch (error) {
        res.send({
            status: 200,
            message: `Error encountered: ${error}`
        });
    }
});

router.get('/google/failure', (req, res) => {
    console.error('Google login failed');
    res.status(401).send({
        status: 401,
        message: 'Login failure'
    });
});

// export the router
module.exports = router;