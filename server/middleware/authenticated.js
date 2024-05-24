const passport = require('passport');

// middleware that checks that any valid user has been established with the current session
const isAuthenticated = passport.authenticate('jwt', { session: false });

module.exports = {
    isAuthenticated
}