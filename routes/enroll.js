let express = require('express');
let router =  express.Router();
let db = require('../db.js');

router.get('/', function(req, res, next) {
    res.render('enroll');
});

router.post('/', async function(req, res, next){
    if (!req.body.code) {
       res.render('enroll', {error: 'Invalid code.'});
    }
    try {
        if (res.locals.user.instructor) {
            course = await db.Course.findOneAndUpdate({instructor_enrollment_code : req.body.code}, {$addToSet : { instructors : res.locals.user._id} }).exec();
        } else {
            course = await db.Course.findOneAndUpdate({student_enrollment_code : req.body.code}, {$addToSet : { students : res.locals.user._id} }).exec();
        }
    } catch (err) {
        res.render('enroll', {error: 'Error occured while updating.'});
        return;
    }
    if (course == null) {
        res.render('enroll', {error: 'Invalid code. Not added to any courses.'});
        return;
    }
    res.redirect('course?courseid=' + course._id);
});

module.exports = router;