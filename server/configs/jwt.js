exports = module.exports = {
    jwtSecret: process.env.JWT_SECRET,
    defaultExpires: '8h',
    issuer: 'Component Tracker Authentication Server',
    subject: 'user',
    audience: ['access', 'refresh'],
    /**
     * Function used to create a JWT token. The supplied
     * userId is the JWT payload.
     * 
     * @param userId        The Id of the authenticated user
     * @param expires       The amount of time in seconds or an a string describing a time span zeit/ms. Eg: 60, "2 days", "10h", "7d"
     * @param audience      The audience for the token ("access" or "refresh")
     * 
     * @returns {string}    The signed JWT token
     */
    signingFunction: function(userId, expires, audience) {
        const expiresIn = expires || this.defaultExpires;
        return require('jsonwebtoken').sign({ userId }, this.jwtSecret, { 
            expiresIn: expiresIn,
            issuer: this.issuer,
            subject: this.subject,
            audience: audience || 'access',
        });
    }
};

