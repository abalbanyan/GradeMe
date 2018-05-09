const express = require('express');
const router =  express.Router();
const db = require('../db.js');

router.get('/', async function(req, res, next) {
    const courseid = req.query.courseid;
    const instructor = res.locals.user.instructor;
    const userid = res.locals.user._id;
    const admin = res.locals.user.admin;

    if(courseid && instructor && await db.utils.belongsToCourse(courseid, userid, instructor, admin)) {
        let course = await db.Course.findById(courseid);
        res.render('edit-course', {course: course});
    } else {
        res.render('error', {message: "You do not have access to this course."});
    }
});

// Breaking the RESTful rules a bit here. This should be PUT ideally
router.post('/', async function(req, res, next) {
    // Verify and sanitize form data here
    const courseid = req.query.courseid;
    const instructor = res.locals.user.instructor;
    const userid = res.locals.user._id;
    const courseupdate = {
        name: req.body.course_name,
        desc: req.body.course_desc,
        visible: req.body.course_visible ? true : false
    };

    if(courseid && instructor && await db.utils.isCourseInstructor(courseid, userid)) {
        db.Course.findByIdAndUpdate(courseid, courseupdate, (err, course) => {
            if(err) {
                console.log(err);
                res.redirect('error');
                // res.render('edit-course', {
                //     course: course,
                //     error: "Error modifying course."
                // });
            } else {
                res.redirect('courses');
            }
        })
    } else {
        // TODO: error message about no course id being provided
        res.redirect('error');
    }
});

router.delete('/', async function(req, res, next) {
    const courseid = req.query.courseid;
    const instructor = res.locals.user.instructor;
    const userid = res.locals.user._id;

    if(courseid && instructor && await db.utils.isCourseInstructor(courseid, userid)) {
        db.Course.findByIdAndRemove(courseid, (err) => {
            if(err) {
                console.log(err);
                res.sendStatus(404);
            } else {
                // TODO: This redirect call currently does not work in a delete call
                res.sendStatus(200);
            }
        });
    } else {
        res.sendStatus(401);
    }
});

module.exports = router;
