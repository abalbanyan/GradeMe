var express = require('express');
var router =  express.Router();

router.get('/', function(req, res, next) {
    // Get current course data
    var course = {
        name: 'Placeholder Name',
        desc: 'Placeholder Description',
        visible: true
    };

    res.render('edit-course', {
        course: course
    });
});

router.post('/', function(req, res, next) {
    // Verify form data is valid and update database

    var course = {};
    var success = true;

    if (success) {
        res.redirect('courses');
    } else {
        res.render('edit-course', {
            course: course,
            errormessage: "Error modifying course"
        });
    }
});

module.exports = router;
