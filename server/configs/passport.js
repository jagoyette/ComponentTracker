const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

const UserRepository = require("../models/user");
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

module.exports = passport;