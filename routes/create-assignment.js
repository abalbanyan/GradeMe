var express = require('express');
var router =  express.Router();
var db = require('../db.js');

router.get('/', async function(req, res, next) {
    // TODO: Test validation more.
    let isCourseInstructor = await db.utils.belongsToCourse(req.query.courseid, res.locals.user._id, true);
    if (res.locals.user.instructor && isCourseInstructor) {
        res.render('create-assignment', {courseid : req.query.courseid});
    } else {
        // Doesn't quite work due to format of error ejs.
        res.render('error',JSON.parse('{ "message" : "You do not have permission to view this page." }'));
    }
});

router.post('/', async function(req, res, next) {
    // Verify that this user is allowed to make this request.
    let isCourseInstructor = await db.utils.belongsToCourse(req.query.courseid, res.locals.user._id, true);
    if (!res.locals.user.instructor || !isCourseInstructor) {
        return res.status(500);
    }

    // TODO: Validate input.
    let name = req.body.name;
    let duedate = req.body.dueDate;
    let pointvalue = req.body.pointValue;
    let desc = req.body.desc;
    let specFile = req.body.specFile;
    let realtimegrading = (req.body.RTGRadios === 'yes');
    let testcasesvisible = (req.body.testCasesViewableRadios === 'yes');

    let newassignment = new db.Assignment({
        name: name,
        desc: desc,
        grading: {
            due_date: duedate,
            total: pointvalue
        }
    });
    newassignment.save(async (err) => {
        if (err) return res.status(500);
    
        // Must save new assignment to course.
        try {
            await db.Course.findByIdAndUpdate(req.query.courseid,
                    {$addToSet: {assignments: newassignment._id} }).exec();
        } catch (err) {
            // Failure. Try to roll back previous assignment (but not a big deal if it doesn't delete).
            console.error(err);
            await db.Course.removeById(newassignment._id).exec();
            return res.status(500);
        }
        res.redirect('/assignment?assignid=' + newassignment._id);
    });
});

module.exports = router;