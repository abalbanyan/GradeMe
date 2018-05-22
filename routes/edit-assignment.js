var express = require('express');
var router =  express.Router();
let db = require('../db.js');
let fileutils = require('../fileutils.js');
const { GradingEnvironment } = require('../autograder/autograder.js');

let multer = require('multer');
let upload = multer({dest: 'course-data/uploads'});

router.get('/', async function(req, res, next) {
    let userid = res.locals.user._id;
    let instructor = res.locals.user.instructor;
    let assignid = req.query.assignid;

    let assignment = await db.Assignment.findById(assignid).exec();

    // Ensure this user belongs to the course and that they are an instructor.
    let course = await db.Course.findOne({assignments : assignid}).exec();
    if (!instructor || !(await db.utils.belongsToCourse(course._id, userid, true, res.locals.user.admin))) {
        return res.render('error', {message: "You do not belong to this course."});
    }

    res.render('edit-assignment', {
        assignment: assignment
    });
});

router.post('/', async function(req, res, next) {
    let userid = res.locals.user._id;
    let instructor = res.locals.user.instructor;
    let assignid = req.body.assignid;

    try {
        let assignment = await db.Assignment.findById(assignid).exec();

        // Ensure this user belongs to the course and that they are an instructor.
        let course = await db.Course.findOne({assignments : assignid}).exec();
        if (!instructor || !(await db.utils.belongsToCourse(course._id, userid, true, res.locals.user.admin))) {
            return res.render('error', {message: "You do not belong to this course."});
        }
    
        // Update settings.
        let updated = await db.Assignment.findByIdAndUpdate(assignid, {
            'gradeonsubmission': (req.body.gradeonsubmission)? true : false,
            'visible': (req.body.visible)? true: false
        }).exec();
    } catch (err) {
        return res.render('error', {error: err, message: "Error saving assignment settings."});
    }
    return res.redirect('assignment?assignid=' + assignid);
});

router.post('/upload/:action', upload.single('file'), async function(req, res, next) {
    let userid = res.locals.user._id;
    let instructor = res.locals.user.instructor;
    let assignid = req.body.assignid;
    let action = req.params.action;
    
    if (!req.file || !req.file.path) {
        res.json(JSON.stringify({ upload: false, error: 'No file was uploaded.' }));
    }

    // Ensure this user belongs to the course and that they are an instructor.
    let course = await db.Course.findOne({assignments : assignid}).exec();
    if (!instructor || !(await db.utils.belongsToCourse(course._id, userid, true, res.locals.user.admin))) {
        res.json(JSON.stringify({ upload: false, error: 'You do not have access to this assignment.' }));
    }
    
    try {
        let newassignment = null;
        if (req.params.action === 'spec') {
            // Save the file.
            let newpath = await fileutils.saveSpec(assignid, req.file.path);
            await db.Assignment.findByIdAndUpdate(assignid, {'spec.path': newpath}).exec();
        } else if (req.params.action === 'dockerfile') {
            let newpath = await fileutils.saveAssignmentFile(assignid, req.file.path, 'Dockerfile');
            newassignment = await db.Assignment.findByIdAndUpdate(assignid, {'gradingenv.dockerfile': newpath}).exec();
        } else if (req.params.action === 'testscript') {
            let newpath = await fileutils.saveAssignmentFile(assignid, req.file.path, 'test.sh');
            newassignment = await db.Assignment.findByIdAndUpdate(assignid, {'gradingenv.testscript': newpath}).exec();
        } else if (req.params.action === 'makefile') {
            let newpath = await fileutils.saveAssignmentFile(assignid, req.file.path, 'Makefile');
            newassignment = await db.Assignment.findByIdAndUpdate(assignid, {'gradingenv.makefile': newpath}).exec();
        } else {
            return res.json(JSON.stringify({ upload: false, error: 'Invalid upload.' }));
        }
        
        // Remake grading tar if dockerfile, testscript, or makefile were updated.
        if (newassignment) {
            let gradingenvfiles =  [ newassignment.gradingenv.dockerfile, newassignment.gradingenv.testscript, newassignment.gradingenv.makefile ];
            let envArchive = await fileutils.makeEnvTar(assignid, gradingenvfiles, 'env.tar');
            if (!envArchive) { throw new Error(); }

            // Rebuild the autograder's grading environment using the new archive.
            let gradingEnvironment = new GradingEnvironment(assignid, envArchive);
            await gradingEnvironment.init();
            console.log("Rebuilding image.");
        }

    } catch (err) {
        console.error(err);
        return res.json(JSON.stringify({ upload: false, error: 'Error uploading file.' }));
    }

    // Return a confirmation of success.
    res.json(JSON.stringify({ upload: true }));
});

module.exports = router;