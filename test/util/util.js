const User = require('../../models/User.js');
const TempUser = require('../../models/TempUser.js');
const Assignment = require('../../models/Assignment.js');

/**
 * Creates a user for testing, with the name `tag`
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
    const name = tag;
    const uid = Math.floor(Math.random() * 1000000000);
    const user = new User({
        email: name + '@grademe.edu',
        name: {first: name, last: name},
        password: name,
        instructor: instructor,
        admin: admin,
        uid: uid,
        kind: "User"
    });
    return user;
};

/**
 * Creates a user OBJECT for testing, with the name `tag`
 *
 * @param {String} type
 *   The type of user, either admin, instructor, or student
 * @param {String} tag
 *   A tag to identify the user
 */
const createTestUserObject = (type, tag) => {
    if(type !== 'admin' && type !== 'instructor' && type !== 'student') return null;
    const instructor = (type === 'instructor') || (type === 'admin');
    const admin = type === 'admin';
    const name = tag;
    const uid = Math.floor(Math.random() * 1000000000);
    const user = {
        email: name + '@grademe.edu',
        name: {first: name, last: name},
        password: name,
        instructor: instructor,
        admin: admin,
        uid: uid
    };
    return user;
};

/**
 * Creates a TempUser for testing, with the name `tag`
 *
 * @param {String} type
 *   The type of user, either admin, instructor, or student
 * @param {String} tag
 *   A tag to identify the user
 * @param {String} url
 *   String to user as verification url code
 * @param {[String]} codes
 *   Array of Strings which represent enrollment codes
 */
const createTestTempUser = (type, tag, url, codes) => {
    if(type !== 'admin' && type !== 'instructor' && type !== 'student') return null;
    const instructor = (type === 'instructor') || (type === 'admin');
    const admin = type === 'admin';
    const name = tag;
    const uid = Math.floor(Math.random() * 1000000000);
    const tempUser = new TempUser({
        email: name + '@grademe.edu',
        name: {first: name, last: name},
        password: name,
        instructor: instructor,
        admin: admin,
        uid: uid,
        GENERATED_VERIFYING_URL: url,
        enroll_codes: codes,
        kind: "TempUser"
    });
    return tempUser;
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
    createTestAssignment: createTestAssignment,
    createTestUser: createTestUser,
    createTestTempUser: createTestTempUser,
    createTestUserObject: createTestUserObject
};
