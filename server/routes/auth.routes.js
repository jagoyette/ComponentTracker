const express = require("express");
const passport = require("passport");

const router = express.Router();


// Login / Logout API
router.get('/login', (req, res) => {
    res.redirect('google/login');
});

router.get('/logout', function (req, res, next) {
    req.logOut(function (err) {
        if (err) { return next(err); }
        res.redirect('/');
    });
});

// Login with Google
router.get('/google/login', 
    passport.authenticate('google', { 
        scope: [ 'email', 'profile' ] 
    })
);

// Google Authentication callback
router.get('/google/callback', 
    passport.authenticate('google', {
        successRedirect: '../google/callback/success',
        failureRedirect: '../google/callback/failure'
    })
);

// success - user authenticated via Google
router.get('/google/callback/success', (req , res, next) => { 
    if(!req.user)
       res.redirect('../google/callback/failure'); 
    else
        res.send('OK');
}); 
  
// failure - user was not authenticated via Google
router.get('/google/callback/failure', (req , res) => { 
    res.status(401).send("Google Authentication Error"); 
});


// export the router
module.exports = router;