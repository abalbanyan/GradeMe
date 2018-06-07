const mongoose = require('mongoose');
const MongodbMemoryServer = require('mongodb-memory-server');
const Assignment = require('../../models/Assignment');
const Course = require('../../models/Course');
const Submission = require('../../models/Submission');
const TempUser = require('../../models/TempUser');
const User = require('../../models/User');
const util = require('./util');

const EXPIRE_TIME_IN_SECONDS = 24*60*60;

const startMongo = () => {
    const mongoServer = new MongodbMemoryServer.default();
    mongoServer.getConnectionString().then((mongoUri) => {
        mongoose.connect(mongoUri)
        .then(() => {
            console.log('Memory database connection successful.');
        })
        .catch(err => {
            console.log('Memory database connection error.');
        });
    });
};

const initMongo = () => {
    let users = {};
    let assignments = {};
    let courses = {};

    users.admin = util.createTestUser('admin', 'admin');
    users.instructor_in = util.createTestUser('instructor', 'instructor_enrolled');
    users.student_in = util.createTestUser('student', 'student_enrolled');
    users.instructor_out = util.createTestUser('instructor', 'instructor_notenrolled');
    users.student_out = util.createTestUser('student', 'student_notenrolled');

    assignments.visible = util.createTestAssignment('visible', true);
    assignments.invisible = util.createTestAssignment('notvisible', false);

    courses.visible = new Course({
        name: 'Visible',
        desc: 'idk',
        assignments: [
            assignments.visible._id,
            assignments.invisible._id
        ],
        students: [users.student_in._id],
        instructors: [users.instructor_in._id],
        main_instructor: [users.instructor_in._id],
        visible: true
    });
    courses.invisible = new Course({
        name: 'Invisible',
        desc: 'idk',
        assignments: [
            assignments.visible._id,
            assignments.invisible._id
        ],
        students: [users.student_in._id],
        instructors: [users.instructor_in._id],
        main_instructor: [users.instructor_in._id],
        visible: false
    });

    // Populate DB with default values
    for(let prop in users) {
        users[prop].save();
    }

    for(let prop in assignments) {
        assignments[prop].save();
    }

    for(let prop in courses) {
        courses[prop].save();
    }

    let tempUser = new TempUser({
        GENERATED_VERIFYING_URL: 'xxx',
        email: 'temp@xxx.edu',
        name: {first: "A", last: "B"},
        password: 'none',
        admin: false,
        instructor: false,
        uid: 0
    });
    tempUser.save();
    TempUser.collection.createIndex({ "createdAt": 1 }, { expireAfterSeconds: EXPIRE_TIME_IN_SECONDS });
};

module.exports = {
    mongo: {
        start: startMongo,
        init: initMongo
    }
};
