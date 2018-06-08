let express = require('express');
let router =  express.Router();
let db = require('./db.js');

/**
 * AJAX requests are served using these routes.
 */

/**
 * Used to verify codes used in /enroll.
 */
router.use('/verifycode', async function(req, res, next) {
    let data = {};
    try {
        if (req.query.instructor == undefined || req.query.code == undefined ||
                (res.locals.user.instructor && req.query.instructor != 1) ||
                (!res.locals.user.instructor && req.query.instructor != 0)) {
            data.valid = false;
            data.err = "Invalid request.";
        } else {
            // Look for a course matching this code.
            let course = null;
            if (res.locals.user.instructor) {
                course = await db.Course.findOne({'instructor_enrollment_code' : req.query.code}).exec();
            } else {
                course = await db.Course.findOne({'student_enrollment_code' : req.query.code}).exec();
            }
            if (course == null) {
                data.valid = false;
                data.err = "Incorrect code.";
            } else {
                data.valid = true;
                data.coursename = course.name;
            }
        }
    } catch (err) {
        console.log(err);
        data.valid = false;
        data.err = err;
    }
    res.json(JSON.stringify(data));
});

/**
 * Used to adjust grades in gradbook.
 */
router.use('/changeGrade', async function(req, res, next) {
    let data = {};
    try {
        if (req.query.user == undefined || req.query.assign_id == undefined || req.query.new_grade == undefined || req.query.course_id == undefined ||
                !res.locals.user.instructor || !(await db.utils.isCourseInstructor(req.query.course_id, res.locals.user._id))) {
            data.valid = false;
            data.err = "Invalid request.";
        } else {
            // Look for a submission matching this code.
            let latestSubmission = (await db.Submission.find({ 'userid': req.query.user,
                                                            'assignmentid': req.query.assign_id})
                                                            .sort({ submissiondate: -1 }).limit(1))[0];

            // If instructor is changing grade for student who hasn't submitted assignment.
           if (latestSubmission == null) {
                let submission = new db.Submission({
                    assignmentid: req.query.assign_id,
                    userid: req.query.user,
                    grade: req.query.new_grade
                });

                // TODO: for some reasons this callback never fires even when the save goes through. Defualting to true for now.
                await submission.save(async (err) => {
                    // if (err) {
                    //     data.err = "Failed request.";
                    //     data.valid = false;
                    // } else {
                    //     data.valid = true;
                    // }
                });
                data.valid = true;
            } else { // Editing assignment grade.
                // TODO: Having trouble with the await's here
                let submission = await latestSubmission.update({ grade: req.query.new_grade }, async function (err) {
                //     if (err) {
                //         data.err = "Failed request.";
                //     } else {
                //         data.valid = true;
                //     }
                });
                data.valid = true;
            }
        }
    } catch (err) {
        data.valid = false;
        data.err = err;
    }
    res.json(JSON.stringify(data));
});

module.exports = router;