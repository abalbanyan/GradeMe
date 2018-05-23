let express = require('express');
let router =  express.Router();
let db = require('../db.js');
let auth = require('../auth.js');

router.get('/', function(req, res, next) {
    res.render('create-account');
});

router.post('/', async function(req, res, next) {
    let email = req.body.email;  // Bootstrap form already validates FORM of email.
    let password = req.body.password;
    let firstname = req.body.firstname;
    let lastname = req.body.lastname;
    let instructor = (req.body.userradios === 'instructor');
    let uid = req.body.uid;

    // Package data of new user to pass to createTempUser.
    let newUser = {
            email: email,
            password: password,
            name: {first: firstname, last: lastname},
            instructor: instructor,
            uid: parseInt(uid)
        };
    
    if (req.body.codes) {
        if (!(req.body.codes instanceof Array)) {
            // Only one code was submitted. Convert to an array.
            req.body.codes = [req.body.codes];
        }
    } 
        
    // Create temp user pre-verification.
    db.EmailVerification.createTempUser(newUser, req.body.codes, function(err, existingPersistentUser, newTempUser) {
        if (err) {
            console.log('error: ' + err);
            res.render('error', {message: 'Creating temp user FAILED! :C'});
        }  

        // user already exists in persistent collection
        if (existingPersistentUser) {
            res.render('email-verification', 
                       {errormessage: 'You have already signed up and confirmed your account with the email ' + email + '. Did you forget your password?'});
        }

        // new user created
        if (newTempUser) {
            var URL = newTempUser[db.EmailVerification.options.URLFieldName];

            db.EmailVerification.sendVerificationEmail(email, URL, function(err, info) {
                if (err) {
                    console.log('send email error: ' + err);
                    res.render('error', {message: 'Sending verification email FAILED! :C'});
                    
                }
                res.render('email-verification', {statusmessage: 'An email has been sent to ' + email + '. Please check it to verify your account.'});           
            });

            // user already exists in temporary collection!
        } else {
            res.render('email-verification', {statusmessage: 'You have already signed up. Please check your email to verify your account.'});           
        }
    });
});

module.exports = router;
