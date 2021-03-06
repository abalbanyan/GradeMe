const express = require('express');
const router =  express.Router();
const db = require('../db.js');

router.get('/', function(req, res, next) {
    let instructor = res.locals.user.instructor;

    if(instructor) {
        res.render('create-course');
    } else {
        res.status(403);
        res.render('error', {message: "You do not have access to this page."});
    }
});

router.post('/', function(req, res, next) {
    // Validate and sanitize data here

    let admin = res.locals.user.admin;
    let instructor = res.locals.user.instructor;
    let instructor_id = res.locals.user._id;

    let course_data = {
        name: req.body.course_name,
        desc: req.body.course_desc,
        assignments: [],
        students: [],
        instructors: [instructor_id],
        main_instructor: instructor_id,
        visible: req.body.course_visible ? true : false
    };

    if(admin || instructor) {
        let course = new db.Course(course_data);
        course.save(err => {
            if(err) {
                console.error(err);
                res.status(500);
                res.render('error', { message: 'Unable to create course. Database Error.' });
            }
            else {
                res.render('create-course', {
                    course: course
                });
            }
        });
    } else {
        res.status(403);
        res.render('error', { message: "You do not have access to this page." });
    }
});

module.exports = router;
