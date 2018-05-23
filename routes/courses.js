var express = require('express');
var router =  express.Router();
let getUserID = require('../auth.js').getUserID;
let db = require('../db.js');

router.get('/', async function(req, res, next) {
    let instructor = res.locals.user.instructor;
    let admin = res.locals.user.admin;
    let courses = await db.utils.getCourses(res.locals.user._id, instructor, admin);
    let confirmNewUser = req.query.confirmNewUser;
    if (confirmNewUser != null) {
        res.locals.statusmessage = 'Your email has been verified successfully!';
    } 
    
    res.render('courses', {
        instructor: instructor,
        courselist: courses
    });
});

module.exports = router;