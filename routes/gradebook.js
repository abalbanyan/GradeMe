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

        // Gather assignment data for dropdown and ejs variable passing
        var assignments = [];
        var assignmentNames = [];
        for (i = 0; i < course.assignments.length; i++) {
            let tmpassignment = await db.Assignment.findOne({'_id': course.assignments[i]}).exec();
            if (tmpassignment != null) {
                // Do not add the current assignment to our dropdown menu.
                if (!req.query.assignid || req.query.assignid != tmpassignment._id) {
                    assignments.push(tmpassignment);
                    assignmentNames.push(tmpassignment.name);
                }
            }
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

                    let studentName = (await db.User.find({'_id': course.students[i]}).exec())[0];

                    let grade = null;
                    if (latestSubmission) {
                        if (latestSubmission.grade) {
                            grade = latestSubmission.grade;
                        } else {
                            grade = "ungraded";
                        }
                    } else {
                        grade = "no submission";
                    }

                    let submissiondate = latestSubmission ? latestSubmission.submissiondate : "n/a";
                    if (submissiondate != "n/a") {
                        let dateoptions = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric'};
                        submissiondate = submissiondate.toLocaleDateString("en-US", dateoptions);
                    }
                    let submissionpath = latestSubmission && latestSubmission.submissionpath ? latestSubmission.submissionpath : "n/a";

                    let row = new Object();
                    row.uid = studentName.uid;
                    studentName = studentName.name.last + ', ' + studentName.name.first;
                    row.name = studentName;
                    row.grade = grade;
                    row.submissiondate = submissiondate;
                    row.submissionpath = submissionpath;

                    rows.push(row);
                }

                res.render('gradebookassignment', {
                    tablerows: rows,
                    course: course,
                    assignment: assignment,
                    assignments: course.assignments,
                    assignmentNames: assignmentNames,
                    headers: ["UID", "Name", "Grade", "Submission Date", "Submission"],
                    students: course.students
                });
            }
        } else {
            var tablerows = [];
            var headers = ["ID", "Name", "Total Grade"];
            var maxCourseGrade = 0;


            if (assignments.length != course.assignments.length) {
                alert("Database mismatch error, please notify an admin");
            }

            for (i = 0; i < course.students.length; i++) {
                let studentName = (await db.User.find({'_id': course.students[i]}).exec())[0];
                let row = new Object();
                row.uid = studentName.uid;
                studentName = studentName.name.last + ', ' + studentName.name.first;
                row.name = studentName;
                row.assignmentGrades = [];
                row.studentTotalGrade = 0;

                for (j = 0; j < assignments.length; j++) {
                    if (assignments[j] != null) {
                        let latestSubmission = (await db.Submission.find({ 'userid': course.students[i],
                                                                        'assignmentid': course.assignments[j]})
                                                                        .sort({ submissiondate: -1 }).limit(1))[0];

                        let grade = null;
                        if (latestSubmission) {
                            if (latestSubmission.grade) {
                                grade = latestSubmission.grade;
                            } else {
                                grade = "ungraded";
                            }
                        } else {
                            grade = "no submission";
                        }
                        row.assignmentGrades.push(grade);

                        if (i == 0 && assignments[j].visible) { // We want to know the maximum grade and know the assignment names.
                            maxCourseGrade += assignments[j].gradetotal;
                        }

                        // TODO: should we add the grades if the assignment isn't visible?
                        if (grade != "ungraded" && grade != "no submission") {
                            row.studentTotalGrade += grade;
                        }
                    }
                }
                tablerows.push(row);
            }

            res.render('gradebookcourse', {
                tablerows: tablerows,
                course: course,
                headersoutertable: headers,
                assignments: course.assignments,
                assignmentNames: assignmentNames,
                maxCourseGrade: maxCourseGrade,
                students: course.students
            });
        }
    } else {
        res.status(403);
        res.render('error', { message: "You do not have access to this page." });
    }
});


module.exports = router;