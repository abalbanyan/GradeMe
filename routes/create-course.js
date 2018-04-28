const express = require('express');
const router =  express.Router();
const db = require('../db.js');

router.get('/', function(req, res, next) {
    res.render('create-course');
});

router.post('/', function(req, res, next) {
    // Validate and sanitize data here

    // Test instructor until auth code is up
    let instructor_id = res.locals.user._id;

    let course_data = {
        name: req.body.course_name,
        desc: req.body.course_desc,
        assignments: [],
        students: [],
        instructors: [instructor_id], // Change this to include current user
        main_instructor: instructor_id,
        visible: req.body.course_visible ? true : false
    };

    let course = new db.Course(course_data);
    course.save(err => {
        if(err) {
            console.error(err);
            res.render('create-course', {
                error: 'Unable to create course. Database Error.'
            });
        }
        else {
            res.render('create-course', {
                course: course
            });
        }
    });
});

module.exports = router;
