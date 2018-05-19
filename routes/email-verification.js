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
            return res.status(404).send('ERROR: resending verification email FAILED');
        }
        if (userFound) {
            res.locals.statusmessagee = 'An email has been sent to you again. Please check it to verify your account.';            
            res.json({
                msg: 'An email has been sent to you, yet again. Please check it to verify your account.'
            });
        } else {
            res.locals.statusmessagee = 'Your verification code has expired. Please sign up again.';                        
            res.json({
                msg: 'Your verification code has expired. Please sign up again.'
            });
        }
    });
});

// user accesses the link that is sent
router.get('/:URL', function(req, res) {
    let url = req.params.URL;
    console.log("in confirm");

    db.EmailVerification.confirmTempUser(url, async function(err, user, codes) {
        if (user) {
            // Authenticate and enroll in courses. TODO: AFTER VERIFICATION move to other route
            auth.sendCookie(res, user._id);
            // TODO FIX once basic thing works
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
            // res.locals.statusmessage = 
            res.json({
                statusmessage: 'You have been confirmed!',  // TODO: Make sure this works. not sure if i need res.locals stuff
                // info: info
            });
            // res.redirect('/courses');  
        } else {
            return res.status(404).send('ERROR: confirming temp user FAILED');
        }
    });
});

module.exports = router;
