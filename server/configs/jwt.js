exports = module.exports = {
    jwtSecret: process.env.JWT_SECRET,
    defaultExpires: '8h',
    issuer: 'Component Tracker Authentication Server',
    subject: 'user',
    audience: ['access', 'refresh'],
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

