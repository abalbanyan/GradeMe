var express = require('express');
var router =  express.Router();
let getUserID = require('../auth.js').getUserID;
let db = require('../db.js');

router.get('/', async function(req, res, next) {
    let instructor = res.locals.user.instructor;
    let courses = await db.utils.getCourses(res.locals.user._id, instructor);
    
    res.render('courses', {
        instructor: instructor,
        courselist: courses
    });
});

module.exports = router;