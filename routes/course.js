var express = require('express');
var router =  express.Router();

var mockData = [
    {assignName: "Stack Breaking!",
     dueDate: new Date()},
     {assignName: "Build another server!! HAHA",
     dueDate: new Date()}
];

router.get('/', function(req, res, next) {
    // TODO: replace mock data.
    res.render('course', {coursename: "tempCourseName", assignments: mockData } );
});

module.exports = router;