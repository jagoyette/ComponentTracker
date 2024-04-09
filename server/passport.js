const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const UserRepository = require("./models/User");

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback',
    passReqToCallback: false
},
    // Verify user function
    async function(accessToken, refreshToken, profile, done) {
        const user = await UserRepository.findOrCreateUser(profile);
        return done(null, user?.toObject());
    }
));