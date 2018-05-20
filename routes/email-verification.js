let express = require('express');
let router =  express.Router();
let db = require('../db.js');
let auth = require('../auth.js');

/**
 * TODO:
 * take lib code and re-engineer for our purposes, with specific schema and all - DONE
 * get it to not redirect to login; get verification link to actually work - DONE
 * get enroll codes to work, after verification - DONE
 * put link to verification page on login page, so user can resend link - DONE, and resending works!
 * replace res.json thingies to render status message, not text page - DO THIS NEXT!!!!
 * redirect to courses after verification, make sure user is logged in - TODO
 */

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
            res.render('email-verification', {statusmessage: 'An email has been sent to you again. Please check it to verify your account.'});            
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
            res.render('email-verification', {statusmessage: 'You have been confirmed!'});                        
        } else {
            res.render('error', {message: 'Confirming temp user FAILED! :C'});
        }
    });
});

module.exports = router;
