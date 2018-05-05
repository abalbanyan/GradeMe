var express = require('express');
var router =  express.Router();
var db = require('../db.js');

router.get('/', function(req, res, next) {
    res.render('create-account');
});

router.post('/', function(req, res, next) {
    // TODO: Validate input.
    let email = req.body.email;
    let password = req.body.password;
    let firstname = req.body.firstname;
    let lastname = req.body.lastname;
    let instructor = (req.body.userradios === 'instructor');

    db.User.create({
        email: email,
        password: password,
        name: {first: firstname, last: lastname},
        instructor: instructor
    }, (err, user) => {
        if (err) {
            return res.status(500);
        }
        auth.sendCookie(res, user._id);
        res.redirect('/courses');
    });
});

module.exports = router;