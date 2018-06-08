const express = require('express');
const router =  express.Router();
const db = require('../db.js');

router.get('/', async function(req, res, next) {
    const courseid = req.query.courseid;
    const instructor = res.locals.user.instructor;
    const userid = res.locals.user._id;
    const admin = res.locals.user.admin;

    if(!courseid) {
        res.status(404);
        return res.render('error', {message: "No course ID provided."});
    }

    if((instructor || admin) && await db.utils.belongsToCourse(courseid, userid, instructor, admin)) {
        let course = await db.Course.findById(courseid);
        res.render('edit-course', {course: course});
    } else {
        res.status(403);
        res.render('error', {message: "You do not have access to this course."});
    }
});

// Breaking the RESTful rules a bit here. This should be PUT ideally
router.post('/', async function(req, res, next) {
    // Verify and sanitize form data here
    const courseid = req.query.courseid;
    const instructor = res.locals.user.instructor;
    const admin = res.locals.user.admin;
    const userid = res.locals.user._id;
    const courseupdate = {
        name: req.body.course_name,
        desc: req.body.course_desc,
        visible: req.body.course_visible ? true : false
    };

    if(!courseupdate.name) {
        res.status(500);
        return res.render('error', {message: "Can't leave field blank."});
    }

    if(!courseid) {
        res.status(404);
        return res.render('error', {message: "No course ID provided."});
    }

    let course = await db.Course.findById(req.query.courseid).exec();
    if(!course) {
        res.status(404);
        return res.render('error', {message: "Course not found."});
    }

    if((instructor || admin) && await db.utils.belongsToCourse(courseid, userid, instructor, admin)) {
        db.Course.findByIdAndUpdate(courseid, courseupdate, (err, course) => {
            if(err) {
                console.log(err);
                res.status(500);
                res.render('error', {message: "Error finding course."});
            } else {
                res.redirect('courses');
            }
        })
    } else {
        res.status(403);
        res.render('error', {message: "You do not have access to this course."});
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
                res.sendStatus(200);
            }
        });
    } else {
        res.sendStatus(401);
    }
});

module.exports = router;
