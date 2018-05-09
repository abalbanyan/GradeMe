let express = require('express');
let router =  express.Router();
let db = require('../db.js');
let auth = require('../auth.js');

router.get('/', function(req, res, next) {
    res.render('create-account');
});

router.post('/', async function(req, res, next) {
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
    }, async (err, user) => {
        if (err) {
            return res.status(500);
        }

        auth.sendCookie(res, user._id);
        try {
            if (req.body.codes) {
                if (!(req.body.codes instanceof Array)) {
                    // Only one code was submitted. Convert to an array.
                    req.body.codes = [req.body.codes];
                }
                let usertype1 = instructor? 'instructor_enrollment_code' : 'student_enrollment_code';
                let usertype2 = instructor? 'instructors' : 'students';
                // Add user to each course they provided.
                await db.Course.findOneAndUpdate({ usertype1: {$in : req.body.codes}, $addToSet : { usertype2 : res.locals.user._id } }).exec();
            }
        } catch (err) {
            res.render('error', {message:"Unable to add user to specified courses."});
        }
        res.redirect('/courses');
    });
});

module.exports = router;