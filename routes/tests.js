var express = require('express');
var router =  express.Router();
var db = require('../db.js');
var { isCourseInstructor } = db.utils;

router.get('/', async function(req, res) {
    // copied from assignment.js '/' route
    // consider moving to middleware
    const assignId = req.query.assignid;
    const userId = res.locals.user.userid;
    const isInstructor = res.locals.user.instructor;
    const course = await db.Course.findOne({assignments : assignId}).exec();

    if (!isInstructor || !isCourseInstructor(course._id, userId)) {
        res.status(403);
        return res.render('error', {
            message: "You do not have access to this assignment."
        });
    }

    /*
    const assignment = await db.Assignment.findById(assignid).exec();
    if (!assignment) {
        res.status(404);
        return res.render('error', {message: "Assignment not found."});
    }
    */

    return res.render('tests', {
        tests: [
            { _id: 0, name: 'test #1', stdin: 'hey there', stdout: 'howdy' },
            { _id: 1, name: 'test #2', stdin: 'wat', stdout: 'ok' }
        ]
    });
});

module.exports = router;