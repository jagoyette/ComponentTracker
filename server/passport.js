const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const UserRepository = require("./models/user");

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

// Check environment
const clientID = process.env.GOOGLE_CLIENT_ID
if (!clientID) {
    console.error('GOOGLE_CLIENT_ID not populated');
}

const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
if (!clientSecret) {
    console.error('GOOGLE_CLIENT_SECRET not populated');
}

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