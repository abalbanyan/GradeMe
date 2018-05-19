let express = require('express');
let router =  express.Router();
let db = require('../db.js');
let auth = require('../auth.js');

router.get('/', function(req, res, next) {
    res.render('create-account');
});

router.post('/', async function(req, res, next) {
    // TODO: Validate input.
    let email = req.body.email;  // Bootstrap form already validates FORM of email.
    let password = req.body.password;
    let firstname = req.body.firstname;
    let lastname = req.body.lastname;
    let instructor = (req.body.userradios === 'instructor');
    let uid = req.body.uid;

    // Create new User.
    let newUser = new db.User({
            email: email,
            password: password,
            name: {first: firstname, last: lastname},
            instructor: instructor,
            uid: uid
        });
    console.log('newUser: ' + newUser);
    
    // db.User.create({
    //     email: email,
    //     password: password,
    //     name: {first: firstname, last: lastname},
    //     instructor: instructor
    // }, async (err, user) => {
    //     if (err) {
    //         return res.status(500);
    //     }
    console.log('before temp user creation');   
    
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
            return res.status(404).send('ERROR: creating temp user FAILED');
        }
        console.log('existing:' + existingPersistentUser);
        console.log('temp:' + newTempUser);        

        // user already exists in persistent collection
        if (existingPersistentUser) {
            res.locals.errormessage = 'You have already signed up and confirmed your account. Did you forget your password?';            
            return res.json({
                msg: 'You have already signed up and confirmed your account. Did you forget your password?'
            });
        }

        // new user created
        if (newTempUser) {
            var URL = newTempUser[db.EmailVerification.options.URLFieldName];

            db.EmailVerification.sendVerificationEmail(email, URL, function(err, info) {
                if (err) {
                    console.log('send email error: ' + err);
                    return res.status(404).send('ERROR: sending verification email FAILED');  // TODO: make this go to our error page or do error status
                }
                res.json({
                    msg: 'An email has been sent to you. Please check it to verify your account.',
                    info: info
                });
                res.render('email-verification');           
            });

            // user already exists in temporary collection!
        } else {
            res.json({
                msg: 'You have already signed up. Please check your email to verify your account.'
            });
        }
    });
    // }); 
});

module.exports = router;
