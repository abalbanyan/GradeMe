var express = require('express');
var router =  express.Router();

router.use('/', function(req, res, next) {
    res.render('login');
});

router.post('/', function(req, res, next) {
    let errors = [];
    if (req.query.email && req.query.password) {
        // TODO: Insert DB query here.

    } else {
        res.render('login', { error : 'missing-username-or-password' });
    }
});

module.exports = router;