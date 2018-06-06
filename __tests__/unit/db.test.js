jest.mock('../../grademe-email-verification');

const app = require('../../app.js'); // This is required for certain dependencies
const util = require('../../jest/jestutil.js');
const Course = require('../../models/Course.js');
const db = require('../../db.js');

let mongoServer;
let users = {};
let assignments = {};
let courses = {};

users.admin = util.createTestUser('admin', '0');
users.instructor_in = util.createTestUser('instructor', 'in');
users.student_in = util.createTestUser('student', 'in');
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

beforeAll(async () => {
    mongoServer = await util.mongo.start();

    // Populate DB with default values
    for(let prop in users) {
        await users[prop].save();
    }

    for(let prop in assignments) {
        await assignments[prop].save();
    }

    for(let prop in courses) {
        await courses[prop].save();
    }
});

afterAll(() => {
    util.mongo.stop(mongoServer);
});

describe('getUser', () => {
    test('find valid admin', async () => {
        let user = await db.utils.getUser(users.admin._id);
        expect(user._id).toEqual(users.admin._id);
    });

    test('find valid instructor', async () => {
        let user = await db.utils.getUser(users.instructor_in._id);
        expect(user._id).toEqual(users.instructor_in._id);
    });

    test('find valid student', async () => {
        let user = await db.utils.getUser(users.student_in._id);
        expect(user._id).toEqual(users.student_in._id);
    });

    test('fail to find non-existent user', async () => {
        let user = await db.utils.getUser('aaaa');
        expect(user).toEqual(null);
    });
});
