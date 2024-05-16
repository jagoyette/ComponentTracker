const express = require("express");
const passport = require("passport");
const axios = require("axios");
const Url = require("url");

const Utils = require('../utils/network');
const StravaAthlete = require("../models/strava.athlete");
const StravaToken = require("../models/strava.token");
const RwgpsAthlete = require('../models/rwgps.athlete');
const UserController = require('../controllers/user');
const RwgpsToken = require("../models/rwgps.token");

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
        state: encodeStateRedirects(req, '/', '../google/failure')
    })(req, res, next);
});

// Google Authentication callback - always called from above
// login route. Use passport to determine results and redirect
// user appropriately
router.get('/google/callback', (req, res, next) => {
    try {
        const { successRedirect, failureRedirect } = decodeStateRedirects(req, '/', '../google/failure');

        // Let passport authenticate and redirect
        passport.authenticate('google', {
            successRedirect,
            failureRedirect
        })(req, res, next);

    } catch (err) {
        console.error(err);
    }
});

router.get('/google/failure', (req, res) => {
    console.error('Google login failed');
    res.send('No dice');
});

///////////////////////////////////////////////////////////////////////////////
// Strava Integration
///////////////////////////////////////////////////////////////////////////////

// Integrate Strava with user account
// This route initiates an OAuth workflow to approve integration
// of their Strava account with this app. The user will be redirected
// to a Strava site where they must approve or reject the integration.
// The Strava site will call our redirect_url below (see /strava/callback)
router.get('/strava/integrate', (req, res, next) => {
    const client_id = process.env.STRAVA_CLIENT_ID;
    const fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
    const callback = Url.resolve(fullUrl, req.baseUrl + '/strava/callback');
    const scope = 'activity:read_all'; //'read';
    const approval_prompt = 'auto';
    const state = encodeStateRedirects(req, '/', '../strava/failure');

    // build the Strava url and redirect user
    const url = new URL('http://www.strava.com/oauth/authorize');
    url.searchParams.append('client_id', client_id);
    url.searchParams.append('redirect_uri', callback);
    url.searchParams.append('response_type', 'code');
    url.searchParams.append('approval_prompt', approval_prompt);
    url.searchParams.append('scope', scope);
    url.searchParams.append('state', state);

    res.redirect(url);
});

// Callback (redirect_uri) called by Strava Oauth
// If the user approved the integration, we will have and authorization
// code in the query params of this request url
router.get('/strava/callback', async function (req, res, next) {
    // extract the authorization code
    const { code, state, scope }= req.query;
    const { successRedirect, failureRedirect } = decodeStateRedirects(req, '/', '../strava/failure');
    const url = "https://www.strava.com/api/v3/oauth/token";
    const client_id = process.env.STRAVA_CLIENT_ID;
    const client_secret = process.env.STRAVA_CLIENT_SECRET;

    if (code) {
        try {
            // Exchange the authorization code for an access token
            const result = await axios.post(url, {
                client_id: client_id,
                client_secret: client_secret,
                grant_type: "authorization_code",
                code: code
            });

            // extract token and athlete data
            const { athlete, access_token, refresh_token, expires_at } = result.data;

            // Get the userId of the current user
            const userId = req.user?.userId;
            if (!userId) {
                console.error('Cannot integrate Strava without signing in');
                res.redirect(failureRedirect);
                return;
            }

            // Create the athlete if needed
            const stravaAthlete = StravaAthlete.fromAthlete(userId, athlete);
            const athleteModel = await StravaAthlete.findOrCreateAthlete(stravaAthlete);
            console.log(`Strava Athlete ${athleteModel.id} integrated for user ${userId}`);

            // Store the access token
            const stravaToken = {
                userId: userId,
                accessToken: access_token,
                refreshToken: refresh_token,
                expiresAt: new Date(expires_at*1000)
            }
            const tokenModel = await StravaToken.createOrUpdateToken(stravaToken);

            // finally redirect to success url
            res.redirect(successRedirect);
            return;

        } catch (error) {
            console.log(`Error getting token`, error);
        }
    }

    // Failed to get authorization
    res.redirect(failureRedirect);
    return;
});

router.get('/strava/failure', (req, res) => {
    console.error('Strava integration falied');
    res.send('No dice');
});

///////////////////////////////////////////////////////////////////////////////
// Ride With GPS Integration
///////////////////////////////////////////////////////////////////////////////

// Integrate Ride With GPS with user account
// This route initiates an OAuth workflow to approve integration
// of the users RWGPS account with this app. The user will be redirected
// to a RWGPS site where they must approve or reject the integration.
// The RWGPS site will call our redirect_url below (see /rwgps/callback)
router.get('/rwgps/integrate', (req, res, next) => {
    const client_id = process.env.RWGPS_CLIENT_ID;
    const originalUrl = Utils.originalURL(req, { proxy: true });
    const callback = Url.resolve(originalUrl, req.baseUrl + '/rwgps/callback');
    const state = encodeStateRedirects(req, '/', '../rwgps/failure');

    // build the RWGPS url and redirect user
    const url = new URL('http://ridewithgps.com/oauth/authorize');
    url.searchParams.append('client_id', client_id);
    url.searchParams.append('redirect_uri', callback);
    url.searchParams.append('response_type', 'code');
    url.searchParams.append('state', state);

    res.redirect(url);
});

// Callback (redirect_uri) called by RWGPS Oauth
// If the user approved the integration, we will have and authorization
// code in the query params of this request url
router.get('/rwgps/callback', async function (req, res, next) {
    // extract the authorization code
    const { code, state, scope }= req.query;
    const { successRedirect, failureRedirect } = decodeStateRedirects(req, '/', '../rwgps/failure');
    const url = "https://ridewithgps.com/oauth/token.json";
    const client_id = process.env.RWGPS_CLIENT_ID;
    const client_secret = process.env.RWGPS_CLIENT_SECRET;

    if (code) {
        // Get the userId of the current user
        const userId = req.user?.userId;
        if (!userId) {
            console.error('Cannot integrate RWGPS without signing in');
            res.redirect(failureRedirect);
            return;
        }
        
        try {
            // We need to pass the original redirect uri
            const originalUrl = Utils.originalURL(req, { proxy: true });
            const redirect_uri = Url.resolve(originalUrl, req.baseUrl + req.path);

            // Exchange the authorization code for an access token
            const body = {
                client_id: client_id,
                client_secret: client_secret,
                grant_type: "authorization_code",
                code: code,
                redirect_uri: redirect_uri
            };
            let result = await axios.post(url, body);

            // create token container from response
            const rwgpsToken = RwgpsToken.createFromRwgps(userId, result.data);

            // retrieve current user info
            result = await axios.get('https://ridewithgps.com/users/current.json', {
                headers: {
                    Authorization: "Bearer " + rwgpsToken.accessToken
                }
            });

            // Create the athlete if needed
            const user = result?.data?.user;
            const rwgpsAthlete = RwgpsAthlete.fromAthlete(userId, user);
            const rwgpsAthleteModel = await RwgpsAthlete.findOrCreateAthlete(userId, rwgpsAthlete);
            console.log(`Ride with GPS Athlete ${rwgpsAthleteModel.id} integrated for user ${userId}`);

            // Store the access token
            const tokenModel = await RwgpsToken.createOrUpdateToken(rwgpsToken);

            // finally redirect to success url
            res.redirect(successRedirect);
            return;

        } catch (error) {
            console.log(`Error getting token`, error);
            console.log(error.response.data);
        }
    }

    // Failed to get authorization
    res.redirect(failureRedirect);
    return;
});

router.get('/rwgps/failure', (req, res) => {
    console.error('RWGPS integration falied');
    res.send('No dice');
});

// export the router
module.exports = router;