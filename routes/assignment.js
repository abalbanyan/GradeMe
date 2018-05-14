var express = require('express');
var router =  express.Router();
let db = require('../db.js');

let multer = require('multer');
let upload = multer({dest: 'course-data/uploads'});

router.get('/', async function(req, res, next) {
    let userid = res.locals.user._id;
    let instructor = res.locals.user.instructor;
    let assignid = req.query.assignid;
    let assignment = await db.Assignment.findById(assignid).exec();

    // Ensure this user belongs to the course.
    let course = await db.Course.findOne({assignments : assignid}).exec();
    if (!(await db.utils.belongsToCourse(course._id, userid, instructor, res.locals.user.admin))) {
        return res.render('error', {message: "You do not belong to this course."});
    }

    res.render('assignment', {
        assignment: assignment,
        instructor: instructor,
        course: course
    });
});

/**
 * Submit the user's uploaded file, provided it passes validation.
 */
router.post('/upload/submission', upload.single('file'), async function(req, res, next) {
    let userid = res.locals.user._id;
    let assignid = req.body.assignid;
    let instructor = res.locals.user.instructor;

    let assignment = await db.Assignment.findById(assignid).exec();

    // Ensure this user belongs to the course.
    let course = await db.Course.findOne({assignments : assignid}).exec();
    if (!course || !(await db.utils.belongsToCourse(course._id, userid, instructor, res.locals.user.admin))) {
        return res.json(JSON.stringify({ upload: true, error: "You do not belong to this course."}));
    }
    // Ensure that the course is visible and that the due date has not passed.
    if (!assignment || (!instructor && !assignment.visible)) {
        return res.json(JSON.stringify({ upload: true, error: "You cannot upload to this assignment."}));
    }
    if (assignment.duedate < Date.now) {
        return res.json(JSON.stringify({ upload: true, error: "The due date for this assignment has passed. You are unable to make any new submissions." }));
    }

    // Create a new submission.
    let submission = new db.Submission({
        assignmentid: req.body.assignid,
        userid: userid,
        submissionpath: req.file.path
    });
    submission.save(async (err) => {
        if (err) {
            res.json(JSON.stringify({ upload: false, error: "Please try again." }));
        } else {
            let output = await db.utils.gradeSubmission(userid, assignid);
            console.log(output);
            res.json(JSON.stringify({ upload: true }));
        }
    });
});

module.exports = router;
