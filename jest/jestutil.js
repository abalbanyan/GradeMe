const mongoose = require('mongoose');
const MongodbMemoryServer = require('mongodb-memory-server');
const User = require('../models/User.js');
const Assignment = require('../models/Assignment.js');

mongoose.Promise = Promise;

// May require additional time for downloading MongoDB binaries
jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;

const startMongo = async () => {
    let mongoServer = new MongodbMemoryServer.default();
    const mongoUri = await mongoServer.getConnectionString();
    await mongoose.connect(mongoUri, (err) => {
        if (err) console.error(err);
    });

    return mongoServer;
};

const stopMongo = (mongoServer) => {
    mongoose.disconnect();
    mongoServer.stop();
};

/**
 * Creates a user for testing, with the name `type`-`tag`
 *
 * @param {String} type
 *   The type of user, either admin, instructor, or student
 * @param {String} tag
 *   A tag to identify the user
 */
const createTestUser = (type, tag) => {
    if(type !== 'admin' && type !== 'instructor' && type !== 'student') return null;
    const instructor = (type === 'instructor') || (type === 'admin');
    const admin = type === 'admin';
    const name = type + tag;
    const uid = Math.floor(Math.random() * 1000000000);
    const user = new User({
        email: name + '@grademe.edu',
        name: {first: name, last: name},
        password: name,
        instructor: instructor,
        admin: admin,
        uid: uid
    });
    return user;
};

/**
 * Create an assignment for testing, with the name ("assignment" + num)
 *
 * @param {Number} name
 *   A name to associate with this assignment, used for distinguishing during testing
 * @param {Boolean} isVisible
 *   Whether or not the assignment is visible to students
 * @param {Boolean} isLate
 *   Whether or not the assignment is late if someone were to turn it in today
 */
const createTestAssignment = (name, isVisible = true, isLate = false) => {
    const dueYear = isLate ? 2012 : 2020; // TODO: This should be updated to be based on the current year
    const assignment = new Assignment({
        name: name,
        desc: name + " description",
        duedate: new Date(dueYear, 1, 1),
        spec: {
            path: 'specs/loremipsum.pdf',
            filetype: 'pdf'
        },
        visible: isVisible
    });
    return assignment;
};

module.exports = {
    mongo: {
        start: startMongo,
        stop: stopMongo
    },
    createTestUser: createTestUser,
    createTestAssignment: createTestAssignment
};
