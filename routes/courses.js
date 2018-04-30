var express = require('express');
var router =  express.Router();

var mockData = [
    {courseName: "Operating Systems",
     courseNum: 111},
     {courseName: "Computer networks",
     courseNum: 118}
];

router.get('/', function(req, res, next) {
    // todo: figure out how to add middleware to all that passes data to all pages
    // TODO: When adding authentication function, add a thing to pass in usertype.
    // res.locals.usertype = "instructor";  // TEMPORARY
    res.render('courses', {courselist: mockData});  // TODO: put real data here
});

module.exports = router;