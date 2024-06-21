const express = require("express");
const Url = require("url");
const axios = require("axios");

const AppState = require('../models/app.state');
const Utils = require("../utils/network");
const { isAuthenticated } = require('../middleware/authenticated');
const RwgpsAthlete = require('../models/rwgps.athlete');
const RwgpsToken = require("../models/rwgps.token");
const RwgpsWebhookNotification = require('../models/rwgps.webhook');

const RwgpsController = require('../controllers/rwgpsAthlete');
const ComponentController = require('../controllers/component');

const router = express.Router();

/**
 * Integrate Ride With GPS with user account
 * The url returned initiates an OAuth workflow to approve integration
 * of the user's RWGPS account with this app. The user will be redirected
 * to a RWGPS site where they must approve or reject the integration.
 * The RWGPS site will call our redirect_url below (see /rwgps/callback)
 * 
 * @swagger
 * 
 * /rwgps/integrate:
 *   post:
 *     summary: Integrate with Ride With GPS
 *     description: Connect to the user's Ride With GPS (RWGPS) account so rides can be imported.
 *       The url returned initiates an OAuth workflow to approve integration
 *       of the user's RWGPS account with this app. The user will be redirected
 *       to a RWGPS site where they must approve or reject the integration. The user will then 
 *       be redirected to one of the redirect Urls specified in the POST data.
 *     tags:
 *     - RWGPS
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
router.post('/rwgps/integrate', isAuthenticated, async (req, res, next) => {
    const client_id = process.env.RWGPS_CLIENT_ID;
    const originalUrl = Utils.originalURL(req, { proxy: true });
    const callback = Url.resolve(originalUrl, req.baseUrl + '/rwgps/callback');

    // extract data from POST
    const successRedirect = req.body?.successRedirect || '../rwgps/success';
    const failureRedirect = req.body?.failureRedirect || '../rwgps/failure';
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

    // build the RWGPS url and redirect user
    const url = new URL('http://ridewithgps.com/oauth/authorize');
    url.searchParams.append('client_id', client_id);
    url.searchParams.append('redirect_uri', callback);
    url.searchParams.append('response_type', 'code');
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
 * /rwgps/athlete:
 *   get:
 *     summary: Get RWGPS Athlete
 *     description: Get's the user's Ride With GPS athlete profile
 *     tags:
 *     - RWGPS
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *          description: A RWGPS Athlete
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
 *                    description: The athlete's user Id in RWGPS
 *                  firstName:
 *                    type: string
 *                    description: Athlete's first name
 *                  lastName:
 *                    type: string
 *                    description: Athlete's last name
 *                  description:
 *                    type: string
 *                    description: Athlete's profile description
 *                  interests:
 *                    type: string
 *                    description: Athlete's interests
 *                  locality:
 *                    type: string
 *                    description: Athlete's locality (city)
 *                  state:
 *                    type: string
 *                    description: Athlete's state
 *                  country:
 *                    type: string
 *                    description: Athlete's country
 *                  name:
 *                    type: string
 *                    description: Athlete's name 
 *                  age:
 *                    type: number
 *                    description: Athlete's age 
 *                  createdAt:
 *                    type: string
 *                    format: date
 *                    description: Date profile was created
 *                  updatedAt:
 *                    type: string
 *                    format: date
 *                    description: Date profile was last updated
 *       404:
 *          description: RWGPS Athlete Not Found
 *       401:
 *          description: Unauthorized
 * 
 */
router.get('/rwgps/athlete', isAuthenticated, async (req, res) => {
    const userId = req.user.userId;
    const athlete = await RwgpsController.getAthleteByUserId(userId);
    if (!athlete) {
        res.status(404).send({
            error: {
                status: 'Not Found',
                message: 'User does not have a RWGPS integration'
            }
        });
    } else {
        res.send(athlete);
    }
});

/**
 * @swagger
 * 
 * /rwgps/athlete:
 *    delete:
 *      summary: Delete RWGPS Athlete
 *      description: Delete's (Unauthorizes) the connection to Ride with GPS for the current user.
 *      tags:
 *      - RWGPS
 *      produces:
 *        - application/json
 *      responses:
 *        200:
 *          description: A RWGPS Athlete
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
 */
router.delete('/rwgps/athlete', isAuthenticated, async (req, res) => {
    const userId = req.user.userId;

    try {
        // delete athlete
        await RwgpsController.deleteAthlete(userId);

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
 * /rwgps/synchronize:
 *    post:
 *      summary: Synchronize RWGPS Rides
 *      description: Retrieves all RWGPS rides for athlete and synchronizes with user rides
 *      tags:
 *      - RWGPS
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
 *          description: RWGPS Athlete Not Found      
 *        401:
 *          description: Unauthorized
 *   
 */
router.post('/rwgps/synchronize', isAuthenticated, async (req, res) => {
    // First make sure we have a valid user
    const userId = req.user.userId;
    const athlete = await RwgpsController.getAthleteByUserId(userId);
    if (!athlete) {
        res.status(404).send({
            error: {
                status: 'Not Found',
                message: 'User does not have a RWGPS integration'
            }
        });
        return;
    }

    // Here we simply launch an async process to start synchronizing strava rides
    // We do not wait for completion
    RwgpsController.synchronizeRides(userId).then(
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
 * Callback (redirect_uri) called by RWGPS Oauth
 * 
 * If the user approved the integration, we will have and authorization
 * code in the query params of this request url
 */
router.get('/rwgps/callback',
    async function (req, res, next) {
        // extract the authorization code
        const { code, state, scope }= req.query;
        const url = "https://ridewithgps.com/oauth/token.json";
        const client_id = process.env.RWGPS_CLIENT_ID;
        const client_secret = process.env.RWGPS_CLIENT_SECRET;

        // Decode our state variable
        const { successRedirect, failureRedirect, appStateId } = JSON.parse(state);

        let userId = undefined;
        try {
            // Lookup the user from our AppState
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
                    res.cookie(appStateCookieName, appState, {maxAge: 10 * 1000});
               }
            }
        } catch (error) {
            console.log(`Error restoring application state`, error);
        }

        if (code) {
            try {
                // Make sure we have a valid user
                if (!userId) {
                    console.error('Cannot integrate RWGPS without signing in');
                    // Resolve the desired Url and redirect response
                    res.redirect(new URL(failureRedirect, Utils.originalURL(req, {proxy: true})));
                    return;
                }

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
                res.redirect(new URL(successRedirect, Utils.originalURL(req, {proxy: true})));
                return;

            } catch (error) {
                console.log(`Error processing RWGPS callback`, error);
                console.log(error?.response?.data);
            }
        }

        // Failed to get authorization
        res.redirect(new URL(failureRedirect, Utils.originalURL(req, {proxy: true})));
        return;
    }
);

/**
 * Default redirect method for successful RWGPS integration
 */
router.get('/rwgps/success', (req, res) => {
    console.info('RWGPS integration succeeded');
    res.send('RWGPS integration success');
});

/**
 * Default redirect method for failed RWGPS integration
 */
router.get('/rwgps/failure', (req, res) => {
    console.info('RWGPS integration failed');
    res.send('RWGPS integration failed');
});


router.post('/rwgps/webhook', async (req, res) => {
    console.info('Received RWGPS Webhook');
    res.status(200).send({
        success: true
    });

    setTimeout( async () => {
        console.log('Processing webhook notifications');
        const { notifications } = req.body;
        if (notifications) {
            console.log('Received ' + notifications.length + ' notifications');
            
            // extract header info
            const apiKey = req.headers['x-rwgps-api-key'];
            const signature = req.headers['x-rwgps-signature'];

            // Save each notification
            for (let index = 0; index < notifications.length; index++) {
                const notification = RwgpsWebhookNotification.createFromRwgps(notifications[index], apiKey, signature);
                const model = await RwgpsWebhookNotification.create(notification);
            }
        }
    }, 0);
});


// export the router
module.exports = router;
