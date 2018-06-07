var express = require('express');
var router = express.Router();
var db = require('../db.js');

router.get('/', async function(req, res, next) {
    if (res.locals.user.instructor) {
        if (!req.query.courseid) {
            res.status(404);
            return res.render('error', {message: "Missing course id."});
        }
        // Does this course exist?
        let course = await db.Course.findById(req.query.courseid).exec();
        if(!course) {
            res.status(404);
            return res.render('error', {message: "Course not found."});
        }

        // Does this instructor have access to this course?
        let belongs = await db.utils.belongsToCourse(req.query.courseid, res.locals.user._id, res.locals.user.instructor, res.locals.user.admin);
        if (!belongs) {
            res.status(403);
            return res.render('error', {message: "You do not have access to this gradebook."});
        }

        // If individual assignment selected display stats for single id.
        if (req.query.assignid) {
            let assignment = await db.Assignment.findOne({'_id': req.query.assignid}).exec()
            if (assignment != null) {
                var rows = [];
                for (i = 0; i < course.students.length; i++) {
                    let latestSubmission = (await db.Submission.find({ 'userid': course.students[i],
                                                                    'assignmentid': req.query.assignid})
                                                                    .sort({ submissiondate: -1 }).limit(1))[0];
                    console.log(latestSubmission);
                    let studentName = (await db.User.find({'_id': course.students[i]}).exec())[0];
                    let grade = latestSubmission && latestSubmission.grade ? latestSubmission.grade : "n/a";
                    let submissiondate = latestSubmission ? latestSubmission.submissiondate : "n/a";
                    let submissionpath = latestSubmission && latestSubmission.submissionpath ? latestSubmission.submissionpath : "n/a";
                    studentName = studentName.name.last + ', ' + studentName.name.first;

                    let row = new Object();
                    row.name = studentName;
                    row.uid = course.students[i];
                    row.grade = grade;
                    row.submissiondate = submissiondate;
                    row.submissionpath = submissionpath;

                    rows.push(row);
                }

                res.render('gradebook', {
                    tablerows: rows,
                    course: course,
                    assignment: assignment,
                    assignments: null,
                    headers: ["ID", "Name", "Grade", "Submission Date", "Submission"]
                });
            }
        } else {
            // TODO
            var rows = [];
            var headers = ["ID", "Name"];
            var maxCourseGrade = 0;

            for (i = 0; i < course.students.length; i++) {
                let studentName = (await db.User.find({'_id': course.students[i]}).exec())[0];
                studentName = studentName.name.last + ', ' + studentName.name.first;
                let row = new Object();
                row.name = studentName;
                row.uid = course.students[i];
                row.assignmentGrades = [];
                row.studentTotalGrade = 0;

                for (j = 0; j < course.assignments.length; j++) {
                    let assignment = await db.Assignment.findOne({'_id': course.assignments[j]}).exec();
                    if (assignment != null) {
                        let latestSubmission = (await db.Submission.find({ 'userid': course.students[i],
                                                                        'assignmentid': course.assignments[j]})
                                                                        .sort({ submissiondate: -1 }).limit(1))[0];

                        let grade = latestSubmission && latestSubmission.grade ? latestSubmission.grade : "n/a";
                        row.assignmentGrades.push(grade);

                        if (i == 0 && assignment.visible) { // We want to know the maximum grade and know the assignment names.
                            let assignmentHeader = new Object();
                            assignmentHeader.name = assignment.name;
                            assignmentHeader.link = req.originalUrl + "&assignid=" + assignment._id;
                            headers.push(assignmentHeader);
                            maxCourseGrade += assignment.gradetotal;
                        }

                        // TODO: should we add the grades if the assignment isn't visible?
                        if (grade != "n/a") {
                            row.studentTotalGrade += grade;
                        }
                    }
                }
                rows.push(row);
            }
            headers.push("Total Grade");

            res.render('gradebook', {
                tablerows: rows,
                course: course,
                headers: headers,
                assignments: course.assignments,
                assignment: null,
                maxCourseGrade: maxCourseGrade
            });
        }
    } else {
        res.status(403);
        res.render('error', { message: "You do not have access to this page." });
    }
});


module.exports = router;