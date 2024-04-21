const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const StravaStrategy = require("passport-strava-oauth2").Strategy;

const UserRepository = require("../models/user");
const StravaAthlete = require("../models/strava.athlete");
const StravaToken = require("../models/strava.token");

passport.serializeUser((user, done) => {
    // Serialize our user with the unique id assigned
    // by our DB. Note this is not the same as the user's
    // profile id.
    done(null, user);
});

passport.deserializeUser((user, done) => {
    // try {
    //     // Retrieve user using the DB unique ID
    //     const user = await UserRepository.findById(userUid);
    //     done(null, user);
    // } catch (error) {
    //     done(error);
    // }
    done(null, user);
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
            return done(null, user?.toObject());
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
            const stravaAthlete = {
                userId: req.user._id,
                ...params.athlete
            };

            // Create the athlete if needes
            const athleteModel = await StravaAthlete.findOrCreateAthlete(stravaAthlete);

            // Store the (updated) access tokens
            const stravaToken = {
                userId: req.user._id,
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