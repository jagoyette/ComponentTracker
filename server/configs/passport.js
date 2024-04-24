const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const StravaStrategy = require("passport-strava-oauth2").Strategy;

const UserRepository = require("../models/user");
const StravaAthlete = require("../models/strava.athlete");
const StravaToken = require("../models/strava.token");

const UserController = require("../controllers/user");

passport.serializeUser((user, done) => {
    // Serialize using unique userId
    done(null, user.getUserId());
});

passport.deserializeUser((userId, done) => {
    // Retrieve our user from database
    UserController.getUserByUserId(userId).then(user => {
        done(null, user);
    });
});

// Register Google authentication strategy
const googleClientID = process.env.GOOGLE_CLIENT_ID
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
if (googleClientID && googleClientSecret) {
    passport.use(new GoogleStrategy({
        clientID: googleClientID,
        clientSecret: googleClientSecret,
        callbackURL: '/auth/google/callback',
        passReqToCallback: false
    },
        // Verify user function
        async function(accessToken, refreshToken, profile, done) {
            const user = await UserRepository.findOrCreateUser(profile);
            return done(null, user);
        }
    ));
} else {
    console.warn('Google Login Strategy not implemented. Make sure CLIENT environment variables are populated.');
}

// Register Strava authentication strategy
const stravaClientID = process.env.STRAVA_CLIENT_ID
const stravaClientSecret = process.env.STRAVA_CLIENT_SECRET;
if (stravaClientID && stravaClientSecret) {
    passport.use(new StravaStrategy({
        clientID: stravaClientID,
        clientSecret: stravaClientSecret,
        callbackURL: '/auth/strava/callback',
        passReqToCallback: true
    },
        // Verify user function
        async function(req, accessToken, refreshToken, params, profile, done) {
            console.log('Successfully integrated with strava');

            // Get the userId of the current user
            const userId = req.user?.userId;

            // Create the athlete if needed
            const stravaAthlete = StravaAthlete.fromAthlete(userId, params.athlete);
            const athleteModel = await StravaAthlete.findOrCreateAthlete(stravaAthlete);

            // Store the (updated) access tokens
            const stravaToken = {
                userId: userId,
                accessToken,
                refreshToken,
                expiresAt: new Date(params.expires_at*1000)
            }
            const tokenModel = await StravaToken.createOrUpdateToken(stravaToken);

            // Finally return with our profile
            return done(null, profile);
        }
    ));
} else {
    console.warn('Strava Login Strategy not implemented. Make sure CLIENT environment variables are populated.');
}

module.exports = passport;