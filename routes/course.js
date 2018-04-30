var express = require('express');
var router =  express.Router();

var mockData = [
    {assignName: "Stack Breaking!",
     dueDate: new Date(),
     status: "submitted!",
     grade: "100/100"},
     {assignName: "Build another server!! HAHA",
     dueDate: new Date(),
     status: "not submitted!",
     grade: "N/A"}
];

router.get('/', function(req, res, next) {
    // TODO: replace mock data.
    res.render('course', {coursename: "tempCourseName", assignments: mockData } );
});

module.exports = router;