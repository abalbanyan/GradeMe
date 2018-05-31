var express = require('express');
var router =  express.Router();
var db = require('../db.js');

let multer = require('multer');
let upload = multer({dest: 'course-data/uploads'});

router.get('/', async function(req, res, next) {
    const _id = res.locals.user._id;
    const instructor = res.locals.user.instructor;
    const admin = res.locals.user.admin;
    let course = await db.Course.findById(req.query.courseid).exec();

    if(!req.query.courseid || !course) {
        res.status(404);
        return res.render('error',JSON.parse('{ "message" : "Course not found." }'));
    }

    let isCourseInstructor = await db.utils.belongsToCourse(req.query.courseid, _id, instructor, admin);
    if (instructor && isCourseInstructor) {
        res.render('create-assignment', {courseid : req.query.courseid});
    } else {
        // Doesn't quite work due to format of error ejs.
        res.status(403);
        res.render('error',JSON.parse('{ "message" : "You do not have permission to view this page." }'));
    }
});

router.post('/', upload.single('spec'), async function(req, res, next) {
    const _id = res.locals.user._id;
    const instructor = res.locals.user.instructor;
    const admin = res.locals.user.admin;
    let course = await db.Course.findById(req.query.courseid).exec();

    if(!req.query.courseid || !course) {
        return res.status(404);
    }

    // Verify that this user is allowed to make this request.
    let isCourseInstructor = await db.utils.belongsToCourse(req.query.courseid, _id, instructor, admin);
    if (!instructor || !isCourseInstructor) {
        return res.status(500);
    }

    let realtimegrading = (req.body.RTGRadios === 'yes');
    let testcasesvisible = (req.body.testCasesViewableRadios === 'yes');

    let newassignment = new db.Assignment({
        name: req.body.name,
        desc: req.body.desc,
        duedate: req.body.dueDate,
        gradetotal: req.body.pointvalue,
        spec: {
            path: req.file.path,
            filetype: 'pdf' // Currently all we have support for.
        }
    });

    newassignment.save(async (err) => {
        if (err) return res.status(500);

        // Must save new assignment to course.
        try {
            await db.Course.findByIdAndUpdate(req.query.courseid,
                    {$addToSet: {assignments: newassignment._id} }).exec();
        } catch (err) {
            // Failure. Try to roll back previous assignment (but not a big deal if it doesn't delete).
            console.error(err);
            await db.Course.removeById(newassignment._id).exec();
            return res.status(500);
        }
        res.redirect('/assignment?assignid=' + newassignment._id);
    });
});

module.exports = router;
