var express = require('express');
var router =  express.Router();
let getUserID = require('../auth.js').getUserID;
let db = require('../db.js');

router.get('/', async function(req, res, next) {
    let userid = await getUserID(req);
    let user = await db.utils.getUser(userid);
    let instructor = user.instructor;
    let courses = await db.utils.getCourses(userid, instructor);
    
    res.render('courses', {
        instructor: instructor,
        courselist: courses
    });
});

module.exports = router;