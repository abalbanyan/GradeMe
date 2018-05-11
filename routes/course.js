let express = require('express');
let router =  express.Router();
let db = require('../db.js');

router.get('/', async function(req, res, next) {
    if (!req.query.courseid) {
        res.status(404);
        res.render('error', {message: "Missing course id."});
    }
    // Does this course exist?
    let course = await db.Course.findById(req.query.courseid).exec();

    // Does this user have access to this course?
    let belongs = await db.utils.belongsToCourse(req.query.courseid, res.locals.user._id, res.locals.user.instructor, res.locals.user.admin);
    if (!belongs) {
        res.status(403);
        return res.render('error', {message: "You do not have access to this course."});
    }

    let assignments = await db.utils.getAssignments(req.query.courseid, res.locals.user.instructor, res.locals.user.admin);
    // TODO: Retrieve grade if user is a student.
    /*
    if (!res.locals.user.instructor) {
        db.Submission.find({user: res.locals.user._id, assignment: {$in : assignments}})
    }
    for each (assignment in assignments) {
        if (assignment.)
    }
    */
    return res.render('course', {course: course, assignments: assignments } );
});

module.exports = router;
