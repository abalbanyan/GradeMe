let mongoose = require('mongoose');
let shortid = require('shortid');
let Schema = mongoose.Schema;
let ObjectId = Schema.ObjectId;

mongoose.connect(`mongodb://127.0.0.1:27017/grademe`)
.then(() => {
    console.log('Database connection successful.');
})
.catch(err => {
    console.log('Database connection error.');
});

// DB Models.
let User = require('./models/User.js');
let Course = require('./models/Course.js');
let Assignment = require('./models/Assignment.js');
let Grade = require('./models/Grade.js');

// DB Utils.
/**
 * Returns the user associated with this id, or null if none exist.
 *
 * @param {String} userid
 * @return {User}
 */
async function getUser(userid) {
    let user = User.findById(userid);
    return user;
}

/**
 * Retrieves the list of courses this user belongs to.
 *
 * @param {String} userid
 * @param {Boolean} instructor - Is the user an instructor?
 * @param {Boolean} admin - Is the user an admin?
 */
async function getCourses(userid, instructor = false, admin = false) {
    let courses = null;
    if (admin) {
        courses = await Course.find().exec();
    } else if (instructor) {
        courses = await Course.find({instructors : userid}).exec();
    } else {
        courses = await Course.find({students : userid}).exec();
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
async function getAssignments(courseid, showhidden) {
    let course = await Course.findById(courseid);
    let assignments = [];
    if (showhidden) {
        assignments = await Assignment.find({'_id' : {$in : course.assignments} }).exec();
    } else {
        assignments = await Assignment.find({'_id' : {$in : course.assignments}, 'visible' : true}).exec();
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
async function belongsToCourse(courseid, userid, instructor) {
    let course = null;
    if (instructor) {
        course = await Course.findOne({_id: courseid, instructors: userid}).exec();
    } else {
        course = await Course.findOne({_id: courseid, students: userid}).exec();
    }
    return (course != null);
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

// TODO: How are we storing user submissions? Might need a "Submission" model.

module.exports = {
    User: User,
    Course: Course,
    Assignment: Assignment,
    Grade: Grade,
    utils: {
        getUser: getUser,
        getCourses: getCourses,
        isCourseInstructor: isCourseInstructor,
        getAssignments: getAssignments,
        belongsToCourse: belongsToCourse
    }
}
