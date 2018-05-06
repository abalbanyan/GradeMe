var express = require('express');
var router =  express.Router();
let db = require('../db.js');

router.get('/', async function(req, res, next) {
    let instructor = res.locals.user.instructor;    
    let assignid = req.query.assignid;
    let assignment = await db.Assignment.findById(assignid).exec();
    res.render('assignment', {
        assignment: assignment, 
        instructor: instructor
    });
});

router.post('/', function(req, res, next) {
    // TODO: handle file upload.
});

module.exports = router;