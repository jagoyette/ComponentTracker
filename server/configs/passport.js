const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const JWTStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;

const jwtConfig = require("../configs/jwt");
const UserRepository = require("../models/user");
const UserController = require("../controllers/user");

// Register Google authentication strategy
const googleClientID = process.env.GOOGLE_CLIENT_ID
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
if (googleClientID && googleClientSecret) {
    passport.use(new GoogleStrategy({
        clientID: googleClientID,
        clientSecret: googleClientSecret,
        callbackURL: '/auth/google/callback',
        passReqToCallback: true,
    },
        // Verify user function
        async function(req, accessToken, refreshToken, profile, done) {
            const user = await UserRepository.findOrCreateUser(profile);
            return done(null, user, { profile, accessToken, refreshToken });
        }
    ));
} else {
    console.warn('Google Login Strategy not implemented. Make sure CLIENT environment variables are populated.');
}

// Register JWT Authentication
const jwtSecret = jwtConfig.jwtSecret;
if (jwtSecret) {
    passport.use(new JWTStrategy({
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: jwtSecret,
        issuer: jwtConfig.issuer,
        audience: 'access',
    }, async function(jwt_payload, done) {
        const user = await UserController.getUserByUserId(jwt_payload.userId);
        if (!user) {
            return done(null, false);
        }
        return done(null, user);
    }));
} else {
    console.warn('JWT Strategy not implemented. Make sure JWT environment variables are populated.');
}

module.exports = passport;