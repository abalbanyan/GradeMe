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
    let course = await db.Course.findOne({assignments : assignid});
    if (!(await db.utils.belongsToCourse(course._id, userid, instructor, res.locals.user.admin))) {
        return res.render('error', {message: "You do not belong to this course."});
    }

    res.render('assignment', {
        assignment: assignment, 
        instructor: instructor,
    });
});

/**
 * Submit the user's uploaded file, provided it passes validation.
 */
router.post('/', upload.single('submission'), async function(req, res, next) {
    let userid = res.locals.user._id;
    let instructor = res.locals.user.instructor;
    let assignid = req.body.assignid;
    let submissionpath = req.file.path;

    let assignment = await db.Assignment.findById(assignid);

    // Ensure this user belongs to the course.
    let course = await db.Course.findOne({assignments : assignid});
    if (!course || !(await db.utils.belongsToCourse(course._id, userid, instructor, res.locals.user.admin))) {
        console.log(assignid);
        return res.render('error', {message: "You do not belong to this course."});
    }
    // Ensure that the course is visible and that the due date has not passed.
    if (!assignment || (!instructor && !assignment.visible)) {
        console.error(instructor);
        console.error(assignment);
        return res.redirect('courses');
    }
    if (assignment.duedate < Date.now) {
        return res.render('assignment', {
            assignment: assignment,
            instructor: res.locals.user.instructor,
            errormessage: "The due date for this assignment has passed. You are unable to make any new submissions."
        });
    }

    // Create a new submission.
    let submission = new db.Submission({
        assignmentid: req.body.assignid,
        userid: userid,
        submissionpath: submissionpath
    });
    submission.save(err => {
        res.render('assignment', {
            assignment: assignment,
            instructor: res.locals.user.instructor,
            errormessage: (err? ("Unable to submit assignment. Please try again. Error: " + err.message) : null),
            statusmessage: (err? null : "Your assignment has been submitted.")
        });
    });
});
module.exports = router;