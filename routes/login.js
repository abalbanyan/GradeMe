let express = require('express');
let router =  express.Router();
let auth = require('../auth.js');

router.use('/', function(req, res, next) {
    // Shouldn't be trying to log in if already authenticated.
    auth.isAuthenticated(req).then(user => {
        if (user) {
            res.redirect('/courses');
            return;
        } else {
            next(); // Continue to login page.
        }
    });
});

router.get('/', function(req, res, next) {
    res.render('login');
});

router.post('/', async function(req, res, next) {
    let email = req.body.email;
    let password = req.body.password;
    if (email && password) {
        auth.authenticateUser(res, email, password).then(authenticated => {
            if (authenticated) {
                res.redirect('/courses');
            } else {
                res.render('login', { error: 'incorrect'});
            }
        });
    } else {
        res.render('login', { error : 'missing' });
    }
});

module.exports = router;