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

    // Make the due dates more pleasant to read.
    let dateoptions = { year: 'numeric', month: 'long', day: 'numeric' };
    for (let i = 0; i < assignments.length; i++) {
        assignments[i].duedate_formatted = assignments[i].duedate.toLocaleDateString("en-US", dateoptions);
        assignments[i].duedate_overdue = (assignments[i].duedate < Date.now());
    }

    // TODO: Retrieve grade if user is a student.
    if (!res.locals.user.instructor) {
        for (let i = 0; i < assignments.length; i++) {
            let submissions = await db.Submission.find({'userid': res.locals.user._id, 'assignmentid': assignments[i]._id}).exec();
            console.log(submissions);
            if (!submissions || submissions.length == 0) {
                assignments[i].status = 'Unsubmitted';
            } else {
                let mostrecent = submissions.reduce((prev, cur) => (prev.submissiondate > cur.submissiondate)? prev : cur);
                assignments[i].status = mostrecent.grade? (mostrecent.grade + '/' + assignments[i].gradetotal) : 'Submitted';
            }
        }
    } else {
        for (let i = 0; i < assignments.length; i++) {
            assignments[i].status = assignments[i].visible? 'Visible' : 'Not Visible';
        }
    }

    return res.render('course', {course: course, assignments: assignments } );
});

module.exports = router;
