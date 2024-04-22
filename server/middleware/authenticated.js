// middleware that checks that any valid user has been established with the current session
const isAuthenticated = function(req, res, next) {
    if (!req.isAuthenticated()) {
        res.status(401).send({
            error: {
                code: 401,
                message: 'Unauthenticated. No valid user is associated with the current session.'
            }
        });
    } else {
        next();
    }
}

module.exports = {
    isAuthenticated
}