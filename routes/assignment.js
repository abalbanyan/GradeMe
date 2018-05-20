var express = require('express');
var router =  express.Router();
let db = require('../db.js');

let multer = require('multer');
let upload = multer({dest: 'course-data/uploads'});

router.get('/', async function(req, res, next) {
    if(!req.query.assignid) {
        res.status(404);
        return res.render('error', {message: "Missing assignment id."});
    }

    let userid = res.locals.user._id;
    let instructor = res.locals.user.instructor;
    let assignid = req.query.assignid;
    let assignment = await db.Assignment.findById(assignid).exec();
    if(!assignment) {
        res.status(404);
        return res.render('error', {message: "Assignment not found."});
    }

    // Ensure this user belongs to the course.
    let course = await db.Course.findOne({assignments : assignid}).exec();
    if(!course) {
        res.status(500);
        return res.render('error', {message: "Assignment not associated with course."});
    }

    if (!(await db.utils.canViewAssignment(assignment._id, course._id, userid, instructor, res.locals.user.admin))) {
        res.status(403);
        return res.render('error', {message: "You do not have access to this assignment."});
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
            res.json(JSON.stringify({ upload: false, error: "Error saving submission. Please try again." }));
        } else {
            try {
                // Immediately grade the assignment if the option is enabled.
                let grade = assignment.gradeonsubmission? (await db.utils.gradeSubmission(userid, assignid)) : false;
                return res.json(JSON.stringify({ upload: true, grade: grade }));
            } catch (err) {
                console.error(err);
                return res.json(JSON.stringify({ upload: false, error: "Error grading assignment. Please try again."}));
            }
        }
    });
});

module.exports = router;
