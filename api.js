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

module.exports = router;