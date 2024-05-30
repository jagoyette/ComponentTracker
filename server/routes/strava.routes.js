const express = require("express");
const Url = require("url");
const axios = require("axios");

const AppState = require('../models/app.state');
const Utils = require("../utils/network");
const { isAuthenticated } = require('../middleware/authenticated');

const StravaAthlete = require("../models/strava.athlete");
const StravaToken = require("../models/strava.token");
const StravaController = require('../controllers/stravaAthlete');
const StravaTokenController = require('../controllers/stravaToken');
const ComponentController = require('../controllers/component');

const router = express.Router();

/**
 * Integrate Strava with user account
 * The url returned initiates an OAuth workflow to approve integration
 * of the user's Strava account with this app. The user will be redirected
 * to a Strava site where they must approve or reject the integration.
 * The Strava site will call our redirect_url below (see /strava/callback)
 * 
 * @swagger
 * 
 * /strava/integrate:
 *   post:
 *     summary: Integrate with Strava
 *     description: Connect to the user's Strava account so rides can be imported.
 *       The url returned initiates an OAuth workflow to approve integration
 *       of the user's Strava account with this app. The user will be redirected
 *       to a Strava site where they must approve or reject the integration. The user will then 
 *       be redirected to one of the redirect Urls specified in the POST data.
 *     tags:
 *     - Strava
 *     requestBody:
 *       description: Redirect Urls and application state info
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               successRedirect:
 *                 type: string
 *                 description: Url to redirect browser following successful integration
 *               failureRedirect:
 *                 type: string
 *                 description: Url to redirect browser following failed integration
 *               appState:
 *                 type: string
 *                 description: A string containing application state. It will be persisted and made available to the client in a cookie following redirects.
 *               appStateCookieName:
 *                 type: string
 *                 description: Name of the cookie holding application state following redirects.
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Integration details for OAuth workflow
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 url:
 *                   type: string
 *                   description: Url to initiate OAuth approval workflow
 *                 successRedirect:
 *                   type: string
 *                   description: Url to redirect browser following successful integration
 *                 failureRedirect:
 *                   type: string
 *                   description: Url to redirect browser following failed integration
 *                 appStateId:
 *                   type: string
 *                   description: Id assigned to the persisted application state
 *                 appState:
 *                   type: string
 *                   description: A string containing application state. It will be available to the client in a cookie following redirects.
 *                 appStateCookieName:
 *                   type: string
 *                   description: Name of the cookie holding application state following redirects.
 *       401:
 *         description: Unauthorized
 * 
 */
router.post('/strava/integrate', isAuthenticated, async (req, res, next) => {
    const client_id = process.env.STRAVA_CLIENT_ID;
    const fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
    const callback = Url.resolve(fullUrl, req.baseUrl + '/strava/callback');
    const scope = 'activity:read_all';
    const approval_prompt = 'auto';

    // extract data from POST
    const successRedirect = req.body?.successRedirect || '../strava/success';
    const failureRedirect = req.body?.failureRedirect || '../strava/failure';
    const appStateCookieName = req.body?.appStateCookieName || 'appState';
    const { appState } = req.body;

    // Save application state if supplied
    let appStateModel = undefined;
    if (appState) {
        appStateModel = await AppState.create({
            userId: req.user?.userId,
            appState: appState,
            appStateCookieName: appStateCookieName
        });
    }

    // Create state data to pass along to OAuth
    const appStateId = appStateModel?._id.toString();
    const state = JSON.stringify({ successRedirect, failureRedirect, appStateId })

    // build the Strava url and redirect user
    const url = new URL('http://www.strava.com/oauth/authorize');
    url.searchParams.append('client_id', client_id);
    url.searchParams.append('redirect_uri', callback);
    url.searchParams.append('response_type', 'code');
    url.searchParams.append('approval_prompt', approval_prompt);
    url.searchParams.append('scope', scope);
    url.searchParams.append('state', state);

    // Return with the url for starting OAuth flow
    res.send({
        url: url.toString(),
        successRedirect,
        failureRedirect,
        appStateId,
        appState,
        appStateCookieName
    });
});

/**
 * @swagger
 * 
 * /strava/athlete:
 *    get:
 *      summary: Get Strava Athlete
 *      description: Get's the user's Strava athlete profile
 *      tags:
 *      - Strava
 *      produces:
 *        - application/json
 *      responses:
 *        200:
 *          description: A Strava Athlete
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  userId:
 *                    type: string
 *                    description: The user Id this athlete profile belongs to
 *                  id:
 *                    type: string
 *                    description: The athlete's user Id in Strava
 *                  firstName:
 *                    type: string
 *                    description: Athlete's first name
 *                  lastName:
 *                    type: string
 *                    description: Athlete's last name
 *                  profileMedium:
 *                    type: string
 *                    description: Athlete's profile picture (medium)
 *                  profile:
 *                    type: string
 *                    description: Athlete's profile picture
 *                  city:
 *                    type: string
 *                    description: Athlete's city
 *                  state:
 *                    type: string
 *                    description: Athlete's state
 *                  country:
 *                    type: string
 *                    description: Athlete's country
 *                  sex:
 *                    type: string
 *                    description: Athlete's sex 
 *                  summit:
 *                    type: boolean
 *                    description: True if athlete has subscription (Summit)
 *                  createdAt:
 *                    type: string
 *                    format: date
 *                    description: Date profile was created
 *                  updatedAt:
 *                    type: string
 *                    format: date
 *                    description: Date profile was last updated
 *        404:
 *          description: Strava Athlete Not Found
 *        401:
 *          description: Unauthorized
 * 
 */
router.get('/strava/athlete', isAuthenticated, async (req, res) => {
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
 *      summary: Delete Strava Athlete
 *      description: Delete's (Unauthorizes) the connection to Strava for the current user.
 *      tags:
 *      - Strava
 *      produces:
 *        - application/json
 *      responses:
 *        200:
 *          description: A Strava Athlete
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  status:
 *                    type: string
 *                    description: Status result is `Success` or `Error`
 *        401:
 *          description: Unauthorized
 * 
 */
router.delete('/strava/athlete', isAuthenticated, async (req, res) => {
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
 *      summary: Synchronize Strava Rides
 *      description: Retrieves all Strava rides for athlete and synchronizes with user rides
 *      tags:
 *      - Strava
 *      produces:
 *        - application/json
 *      responses:
 *        200:
 *          description: Background synchronization has started
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  result:
 *                    type: string
 *                    description: Message indicating sync started
 *        404:
 *          description: Strava Athlete Not Found      
 *        401:
 *          description: Unauthorized
 * 
 */
router.post('/strava/synchronize', isAuthenticated, async (req, res) => {
    // First make sure we have a valid user
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

/**
 * Callback (redirect_uri) called by Strava Oauth
 * 
 * If the user approved the integration, we will have and authorization
 * code in the query params of this request url
 */
router.get('/strava/callback',
    async function (req, res, next) {
        // extract the authorization code
        const { code, state, scope }= req.query;
        const url = "https://www.strava.com/api/v3/oauth/token";
        const client_id = process.env.STRAVA_CLIENT_ID;
        const client_secret = process.env.STRAVA_CLIENT_SECRET;

        // Decode our state variable
        const { successRedirect, failureRedirect, appStateId } = JSON.parse(state);


        let userId = undefined;
        try {
            // Lookup the user from our AppState and populate a cookie with app state
            let appState = undefined;
            let appStateCookieName = 'appState';
            if (appStateId) {
                const appStateModel = await AppState.findById(appStateId);
                if (appStateModel) {
                    userId = appStateModel.userId;
                    appState = appStateModel.appState;
                    appStateCookieName = appStateModel.appStateCookieName;

                    // delete this state from db
                    appStateModel.deleteOne().then(result => {
                        console.log('Deleted app state');
                    });

                    // Return the application state in a cookie
                    res.cookie(appStateCookieName, appState, {maxAge: 60 * 1000});
                }
            }
        } catch (error) {
            console.log(`Error restoring application state`, error);
        }

            // If successful, get token and athlete info
        if (code) {
            try {
                if (!userId) {
                    console.error('Cannot integrate Strava without signing in');
                    // Resolve the desired Url and redirect response
                    res.redirect(new URL(failureRedirect, Utils.originalURL(req, {proxy: true})));
                    return;
                }

                // Exchange the authorization code for an access token
                const result = await axios.post(url, {
                    client_id: client_id,
                    client_secret: client_secret,
                    grant_type: "authorization_code",
                    code: code
                });

                // extract token and athlete data
                const { athlete, access_token, refresh_token, expires_at } = result.data;

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
                const redirectUrl = new URL(successRedirect, Utils.originalURL(req, {proxy: true}));
                return res.redirect(redirectUrl);
            } catch (error) {
                console.log(`Error processing Strava callback`, error);
            }
        }

        // Failed to get authorization
        res.redirect(new URL(failureRedirect, Utils.originalURL(req, {proxy: true})));
        return;
    }
);

/**
 * Default redirect method for successful Strava integration
 */
router.get('/strava/success', (req, res) => {
    console.info('Strava integration succeeded');
    res.send("Strava integration succeeded");
});

/**
 * Default redirect method for failed Strava integration
 */
router.get('/strava/failure', (req, res) => {
    console.info('Strava integration failed');
    res.send('Strava integration failed');
});

// export the router
module.exports = router;
