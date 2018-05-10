var express = require('express');
var router =  express.Router();
let db = require('../db.js');

router.get('/', async function(req, res, next) {
    let userid = res.locals.user._id;
    let instructor = res.locals.user.instructor;
    let assignid = req.query.assignid;
    let assignment = await db.Assignment.findById(assignid).exec();

    // Ensure this user belongs to the course.
    let course = await db.Course.findOne({assignments : assignid});
    if (!(await db.utils.belongsToCourse(course._id, userid, instructor, res.locals.user.admin))) {
        return res.render('error', {message: "You do not belong to this course."});
    }

    res.render('edit-assignment', {
        assignment: assignment, 
        instructor: instructor,
    });
});

module.exports = router;