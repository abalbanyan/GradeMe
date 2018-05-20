let express = require('express');
let router =  express.Router();
let db = require('../db.js');
let auth = require('../auth.js');
let url = require('url');

router.get('/', function(req, res, next) {
    res.render('email-verification');
});

router.post('/resend', function(req, res, next) {
    // Resend verification email.
    let email = req.body.email;
    db.EmailVerification.resendVerificationEmail(email, function(err, userFound) {
        if (err) {
            res.render('error', {message: 'Resending verification email FAILED! :C'});            
        }
        if (userFound) {
            res.render('email-verification', {statusmessage: 'An email has been sent to you again at ' + email + '. Please check it to verify your account.'});            
        } else {
            res.render('email-verification', {errormessage: 'Your verification code has expired. Please sign up again.'});                        
        }
    });
});

// user accesses the link that is sent
router.get('/:URL', function(req, res) {
    let url = req.params.URL;

    db.EmailVerification.confirmTempUser(url, async function(err, user, codes) {
        if (user) {
            // Authenticate and enroll in courses.
            auth.sendCookie(res, user._id);
            try {
                if (codes) {
                    // Add user to each course they provided.
                    if (user.instructor) {
                        await db.Course.updateMany({ instructor_enrollment_code: {$in : codes} }, { $addToSet : { instructors : user._id } }).exec();
                    } else {
                        await db.Course.updateMany({ student_enrollment_code: {$in : codes} }, { $addToSet : { students : user._id } }).exec();
                    }
                }
            } catch (err) {
                console.log("error: " + err);
                res.render('error', {message:"Unable to add user to specified courses."});
            }
            res.redirect("/courses?confirmNewUser=1");
        } else {
            res.render('error', {message: 'Confirming temp user FAILED! Maybe you confirmed your email already? \nCheck your email for a confirmation email.'});
        }
    });
});

module.exports = router;
