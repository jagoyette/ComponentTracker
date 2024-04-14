const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const UserRepository = require("../models/user");

passport.serializeUser((user, done) => {
    // Serialize our user with the unique id assigned
    // by our DB. Note this is not the same as the user's
    // profile id.
    done(null, user._id);
});

passport.deserializeUser(async (userUid, done) => {
    try {
        // Retrieve user using the DB unique ID
        const user = await UserRepository.findById(userUid);
        done(null, user);
    } catch (error) {
        done(error); 
    }
});

// Register Google authentication strategy
const clientID = process.env.GOOGLE_CLIENT_ID
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
if (clientID && clientSecret) {
    passport.use(new GoogleStrategy({
        clientID: clientID,
        clientSecret: clientSecret,
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

module.exports = passport;