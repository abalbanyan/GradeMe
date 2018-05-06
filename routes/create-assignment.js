var express = require('express');
var router =  express.Router();
var db = require('../db.js');

router.get('/', function(req, res, next) {
    // TODO: Test validation more.
    if (res.locals.user.instructor && db.utils.isCourseInstructor(req.query.courseid, res.locals.user._id)) {
        res.render('create-assignment');
    } else {
        // Doesn't quite work due to format of error ejs.
        res.render('error',JSON.parse('{ "message" : "You do not have permission to view this page." }'));
    }
});

router.post('/', function(req, res, next) {
    // TODO: Validate input.
    let name = req.body.name;
    let duedate = req.body.dueDate;
    let pointvalue = req.body.pointValue;
    let description = req.body.description;
    let specFile = req.body.specFile;
    let realtimegrading = (req.body.RTGRadios === 'yes');
    let testcasesvisible = (req.body.testCasesViewableRadios === 'yes');

    db.Assignment.create({
        name: name,
        desc: description,
        grading: {
            due_date: duedate,
            total: pointvalue
        }
    }, (err) => {
        if (err) {
            return res.status(500);
        }
        // TODO: redirect to newly created assignment page
        res.redirect('/courses');
    });
});

module.exports = router;