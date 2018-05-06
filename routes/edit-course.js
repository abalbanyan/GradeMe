const express = require('express');
const router =  express.Router();
const db = require('../db.js');

router.get('/', async function(req, res, next) {
    const courseid = req.query.courseid;
    const instructor = res.locals.user.instructor;
    const userid = res.locals.user._id;

    if(courseid && instructor && await db.utils.isCourseInstructor(courseid, userid)) {
        db.Course.findById(courseid, (err, course) => {
            if(err) {
                // Redirect to course page and display error message
                // TODO: Display error message on course page
                console.log(err);
                res.redirect('courses');
            } else {
                let instructorid = res.locals.user._id;
                if(course.instructors.includes(instructorid)) {
                    res.render('edit-course', {
                        course: course
                    });
                } else {
                    // TODO: error message about not having access to course
                    res.redirect('courses');
                }
            }
        });
    } else {
        // TODO: error message about no course id being provided
        res.redirect('error');
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
                res.render('edit-course', {
                    course: course,
                    error: "Error modifying course."
                });
            } else {
                res.redirect('error');
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
                res.redirect('error');
            } else {
                // TODO: This redirect call currently does not work in a delete call
                res.redirect('courses');
            }
        });
    } else {
        res.redirect('error');
    }
});

module.exports = router;
