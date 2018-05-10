var express = require('express');
var router =  express.Router();
let db = require('../db.js');

let multer = require('multer');
let upload = multer({dest: 'course-data/uploads'});

router.get('/', async function(req, res, next) {
    let userid = res.locals.user._id;
    let instructor = res.locals.user.instructor;
    let assignid = req.query.assignid;
    let assignment = await db.Assignment.findById(assignid).exec();

    // Ensure this user belongs to the course.
    let course = await db.Course.findOne({assignments : assignid});
    if (!(await db.utils.belongsToCourse(course._id, userid, instructor, res.locals.user.admin))) {
        return res.render('error', {message: "You do not belong to this course."});
    }

    res.render('edit-assignment', {
        assignment: assignment, 
        instructor: instructor,
    });
});

/**
 * Submit the user's uploaded file, provided it passes validation.
 */
router.post('/specs', upload.array('specs'), async function(req, res, next) {
    let userid = res.locals.user._id;
    let instructor = res.locals.user.instructor;
    let assignid = req.body.assignid;
    let specsPath = req.file.path;    
    
    if (!instructor) {
        return res.render('error', {message: "You do not have permission to view this page."});        
    }

    let assignment = await db.Assignment.findById(assignid);

    // Ensure this user belongs to the course.
    let course = await db.Course.findOne({assignments : assignid});
    if (!course || !(await db.utils.belongsToCourse(course._id, userid, instructor, res.locals.user.admin))) {
        console.log(assignid);
        return res.render('error', {message: "You do not belong to this course."});
    }
    
    if (!assignment) {
        console.error(assignment);
        return res.redirect('courses');
    }

    // Update assignment with new specs.
    // figure out file type
    // then update assignment with new specs path and type
});

/**
 * Submit the user's uploaded file, provided it passes validation.
 */
router.post('/test-cases', upload.array('specs'), async function(req, res, next) {
    let userid = res.locals.user._id;
    let instructor = res.locals.user.instructor;
    let assignid = req.body.assignid;
    let specsPath = req.file.path;    
    
    if (!instructor) {
        return res.render('error', {message: "You do not have permission to view this page."});        
    }

    let assignment = await db.Assignment.findById(assignid);

    // Ensure this user belongs to the course.
    let course = await db.Course.findOne({assignments : assignid});
    if (!course || !(await db.utils.belongsToCourse(course._id, userid, instructor, res.locals.user.admin))) {
        console.log(assignid);
        return res.render('error', {message: "You do not belong to this course."});
    }
    
    if (!assignment) {
        console.error(assignment);
        return res.redirect('courses');
    }

    // Update assignment with new test cases.
    
});

/**
 * Submit the user's uploaded file, provided it passes validation.
 */
router.post('/grading-script', upload.array('specs'), async function(req, res, next) {
    let userid = res.locals.user._id;
    let instructor = res.locals.user.instructor;
    let assignid = req.body.assignid;
    let specsPath = req.file.path;    
    
    if (!instructor) {
        return res.render('error', {message: "You do not have permission to view this page."});        
    }

    let assignment = await db.Assignment.findById(assignid);

    // Ensure this user belongs to the course.
    let course = await db.Course.findOne({assignments : assignid});
    if (!course || !(await db.utils.belongsToCourse(course._id, userid, instructor, res.locals.user.admin))) {
        console.log(assignid);
        return res.render('error', {message: "You do not belong to this course."});
    }
    
    if (!assignment) {
        console.error(assignment);
        return res.redirect('courses');
    }

    // Update assignment with new grading script.
    
});

/**
 * Submit the user's uploaded file, provided it passes validation.
 */
router.post('/dockerfile', upload.array('specs'), async function(req, res, next) {
    let userid = res.locals.user._id;
    let instructor = res.locals.user.instructor;
    let assignid = req.body.assignid;
    let specsPath = req.file.path;    
    
    if (!instructor) {
        return res.render('error', {message: "You do not have permission to view this page."});        
    }

    let assignment = await db.Assignment.findById(assignid);

    // Ensure this user belongs to the course.
    let course = await db.Course.findOne({assignments : assignid});
    if (!course || !(await db.utils.belongsToCourse(course._id, userid, instructor, res.locals.user.admin))) {
        console.log(assignid);
        return res.render('error', {message: "You do not belong to this course."});
    }
    
    if (!assignment) {
        console.error(assignment);
        return res.redirect('courses');
    }

    // Update assignment with new dockerfile.
    
});

/**
 * Submit the user's uploaded file, provided it passes validation.
 */
router.post('/makefile', upload.array('specs'), async function(req, res, next) {
    let userid = res.locals.user._id;
    let instructor = res.locals.user.instructor;
    let assignid = req.body.assignid;
    let specsPath = req.file.path;    
    
    if (!instructor) {
        return res.render('error', {message: "You do not have permission to view this page."});        
    }

    let assignment = await db.Assignment.findById(assignid);

    // Ensure this user belongs to the course.
    let course = await db.Course.findOne({assignments : assignid});
    if (!course || !(await db.utils.belongsToCourse(course._id, userid, instructor, res.locals.user.admin))) {
        console.log(assignid);
        return res.render('error', {message: "You do not belong to this course."});
    }
    
    if (!assignment) {
        console.error(assignment);
        return res.redirect('courses');
    }

    // Update assignment with new makefile.

});

module.exports = router;