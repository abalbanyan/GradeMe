let mongoose = require('mongoose');
let shortid = require('shortid');
let nev = require('./grademe-email-verification')(mongoose);
let Schema = mongoose.Schema;
let ObjectId = Schema.ObjectId;
const { GradingEnvironment } = require('./autograder/autograder.js');
const EXPIRE_TIME_IN_SECONDS = 24*60*60;  // 24 hours.

if(process.env.NODE_ENV !== 'test') {
    mongoose.connect(`mongodb://127.0.0.1:27017/grademe`)
    .then(() => {
        console.log('Database connection successful.');
    })
    .catch(err => {
        console.log('Database connection error.');
    });
}

// DB Models.
let User = require('./models/User.js');
let TempUser = require('./models/TempUser.js');
let Course = require('./models/Course.js');
let Assignment = require('./models/Assignment.js');
let Submission = require('./models/Submission.js');

// DB Utils.
/**
 * Returns the user associated with this id, or null if none exist.
 *
 * @param {String} userid
 * @return {User}
 */
async function getUser(userid) {
    let user = await User.findById(userid).exec();
    return user;
}

/**
 * Retrieves the list of courses this user belongs to.
 *
 * @param {String} userid
 * @param {Boolean} instructor - Is the user an instructor?
 * @param {Boolean} admin - Is the user an admin? If so, ignore user ID and return all courses
 */
async function getCourses(userid, instructor = false, admin = false) {
    let courses = null;
    if (admin) {
        courses = await Course.find().exec();
    } else if (instructor) {
        courses = await Course.find({instructors : userid}).exec();
    } else {
        courses = await Course.find({students : userid, visible: true}).exec();
    }
    return courses;
}

/**
 * Retrieves the list of assignments belonging to a course.
 *
 * @param {String} courseid
 * @param {Boolean} showhidden - Show hidden courses?
 * @return {[Assignment]}
 */
async function getAssignments(courseid, showhidden, admin = false) {
    let course = await Course.findById(courseid);
    let assignments = [];
    if(course) {
        if (showhidden || admin) {
            assignments = await Assignment.find({'_id' : {$in : course.assignments} }).exec();
        } else {
            assignments = await Assignment.find({'_id' : {$in : course.assignments}, 'visible' : true}).exec();
        }
    }
    return assignments;
}

/**
 * Determines whether a user belongs to a specific course.
 *
 * @param {String} courseid
 * @param {String} userid
 * @param {Boolean} instructor - Is this user an instructor?
 * @return {Boolean}
 */
async function belongsToCourse(courseid, userid, instructor, admin = false) {
    let course = null;
    if (admin) {
        course = await Course.findById(courseid);
    } else if (instructor) {
        course = await Course.findOne({_id: courseid, instructors: userid}).exec();
    } else {
        course = await Course.findOne({_id: courseid, students: userid, visible: true}).exec();
    }
    return (course != null);
}

/**
 * Determines whether a user can view an assignment
 *
 * @param {String} assignid
 * @param {String} courseid
 * @param {String} userid
 * @param {Boolean} instructor - Is this user an instructor?
 * @param {Boolean} admin - Is this user an admin?
 */
async function canViewAssignment(assignid, courseid, userid, instructor, admin = false) {
    const isInCourse = await belongsToCourse(courseid, userid, instructor, admin);
    if(!isInCourse)
        return false;

    const assignmentCourse = await Course.findOne({_id: courseid, assignments: assignid});
    if(!assignmentCourse)
        return false;

    let assignment = null;
    if(admin || instructor) {
        assignment = await Assignment.findById(assignid);
    } else {
        assignment = await Assignment.findOne({_id: assignid, visible: true});
    }
    return (assignment !== null);
}

/**
 * Looks for this student's most recent submission in this assignment, and grades it.
 */
async function gradeSubmission(studentid, assignid) {
    let submissions = await Submission.find({
        userid: studentid,
        assignmentid: assignid}
    ).exec();
    let assignment = await Assignment.findById(assignid).exec();

    // Look for the most recent submission.
    if (!submissions) {
        return null;
    }
    let mostrecent = submissions.reduce((prev, cur) => (prev.submissiondate > cur.submissiondate)? prev : cur);

    let gradingEnvironment = new GradingEnvironment(assignment._id, assignment.gradingenv.archive);
    await gradingEnvironment.init();
    let gradingContainer = await gradingEnvironment.containerize(studentid, mostrecent.submissionpath);
    await gradingContainer.build();
    let output = await gradingContainer.test();

    let score = 0;
    let total = 0;
    for (let test of output) {
        if (test.pass) {
            score += test.score;
        }
        total += test.score;
    }
    let grade = Math.round((score / total) * assignment.gradetotal);
    await Submission.findByIdAndUpdate(mostrecent._id, {grade: grade}).exec();
    return grade;
}

/**
 * Checks if a course has the specified instructor
 *
 * @param {String} courseid
 * @param {String} instructorid
 */
async function isCourseInstructor(courseid, instructorid) {
    let courses = await Course.find({_id: courseid, instructors: instructorid}).exec();
    return courses.length >= 1;
}

/**
 * Configuration for email verification.
 */
nev.configure({
    persistentUserModel: User,
    tempUserModel: TempUser,

    verificationURL: 'http://localhost:3200/email-verification?verify=${URL}',
    transportOptions: {
        host: 'smtp.gmail.com',
        port: 465,
        secure: true, // use SSL
        auth: {
            user: process.env.VERIFIER_EMAIL || "default",
            pass: process.env.VERIFIER_PASSWORD || "default"
        },
    },

}, function(err, options) {
    if (err) {
        console.log(err);
        return;
    }

    console.log('configured: ' + (typeof options === 'object'));
});

// TODO: How are we storing user submissions? Might need a "Submission" model.

module.exports = {
    User: User,
    Course: Course,
    Assignment: Assignment,
    Submission: Submission,
    TempUser: TempUser,
    EmailVerification: nev,
    EXPIRE_TIME_IN_SECONDS: EXPIRE_TIME_IN_SECONDS,
    utils: {
        getUser: getUser,
        getCourses: getCourses,
        isCourseInstructor: isCourseInstructor,
        getAssignments: getAssignments,
        belongsToCourse: belongsToCourse,
        canViewAssignment: canViewAssignment,
        gradeSubmission: gradeSubmission
    }
}
