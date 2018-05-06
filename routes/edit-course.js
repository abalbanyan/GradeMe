const express = require('express');
const router =  express.Router();
const db = require('../db.js');

router.get('/', function(req, res, next) {
    let courseid = req.query.courseid;
    if(courseid) {
        db.Course.findById(courseid, (err, course) => {
            if(err) {
                // Redirect to course page and display error message
                // TODO: Display error message on course page
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
        res.redirect('courses');
    }
});

// Breaking the RESTful rules a bit here. This should be PUT ideally
router.post('/', function(req, res, next) {
    // Verify form data is valid and update database
    let courseid = req.query.courseid;
    let courseupdate = {
        name: req.body.course_name,
        desc: req.body.course_desc,
        visible: req.body.course_visible ? true : false
    };
    if(courseid) {
        db.Course.findByIdAndUpdate(courseid, courseupdate, (err, course) => {
            if(err) {
                res.render('edit-course', {
                    course: course,
                    error: "Error modifying course."
                });
            } else {
                res.redirect('courses');
            }
        })
    } else {
        // TODO: error message about no course id being provided
        res.redirect('courses');
    }
});

router.delete('/', function(req, res, next) {
    let courseid = req.query.courseid;
    if(courseid) {
        db.Course.findByIdAndRemove(courseid, (err) => {
            if(err) {
                res.render('edit-course', {
                    course: course,
                    error: "Error deleting course."
                });
            } else {
                res.redirect('courses');
            }
        });
    } else {
        res.redirect('courses');
    }
});

module.exports = router;
