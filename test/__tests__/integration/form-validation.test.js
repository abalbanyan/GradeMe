// We mock isAuthentcated here so that we can easily control whether
// or not Express thinks we have access
jest.mock('../../../auth/isAuthenticated.js', () => {
    return jest.fn();
});

const isAuthenticated = require('../../../auth/isAuthenticated.js');
const request = require('supertest');
const app = require('../../../app.js');
const auth = require('../../../auth.js');
const util = require('../../util/jestutil.js');
const User = require('../../../models/User.js');
const Course = require('../../../models/Course.js');

let mongoServer;
let users = {};
let assignments = {};
let courses = {};

users.admin = util.createTestUser('admin', '0');
users.instructor = util.createTestUser('instructor', 'in');
users.student = util.createTestUser('student', 'in');

assignments.visible = util.createTestAssignment('visible', true);
assignments.invisible = util.createTestAssignment('notvisible', false);

courses.visible = new Course({
    name: 'Visible',
    desc: 'idk',
    assignments: [
        assignments.visible._id,
        assignments.invisible._id
    ],
    students: [users.student._id],
    instructors: [users.instructor._id],
    main_instructor: [users.instructor._id],
    visible: true
});
courses.invisible = new Course({
    name: 'Invisible',
    desc: 'idk',
    assignments: [
        assignments.visible._id,
        assignments.invisible._id
    ],
    students: [users.student._id],
    instructors: [users.instructor._id],
    main_instructor: [users.instructor._id],
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

const createCourseForm = (name, desc, visible) => {
    return {
        'course_name': name,
        'course_desc': desc,
        'course_visible': visible
    };
};

let validCourseForm = createCourseForm('Valid Course', 'Valid Course Description', true);
let blankNameCourseForm = createCourseForm('', 'test', true);
let blankDescCourseForm = createCourseForm('test', '', true);
let unicodeCharactersCourseForm = createCourseForm('¶', 'test', true);
let longName = '';
for(let i = 0; i < 1000000; i += 1) {
    longName += 'a';
}
let longNameCourseForm = createCourseForm(longName, 'test', true);

describe('create-course form submission', () => {
    beforeAll(() => {
        isAuthenticated.mockImplementation(async () => { return users.instructor; });
    });

    test('valid form is accepted', async () => {
        let response = await request(app)
            .post('/create-course')
            .type('form')
            .send(validCourseForm);

        expect(response.statusCode).toBe(200);
    });

    test('empty name is rejected', async () => {
        let response = await request(app)
            .post('/create-course')
            .type('form')
            .send(blankNameCourseForm);

        expect(response.statusCode).toBe(500);
    });

    test('empty description is accepted', async () => {
        let response = await request(app)
            .post('/create-course')
            .type('form')
            .send(blankDescCourseForm);

        expect(response.statusCode).toBe(200);
    });

    test('unicode characters are accepted', async () => {
        let response = await request(app)
            .post('/create-course')
            .type('form')
            .send(blankDescCourseForm);

        expect(response.statusCode).toBe(200);
    });

    test('1,000,000 character name is rejected', async () => {
        let response = await request(app)
            .post('/create-course')
            .type('form')
            .send(longNameCourseForm);

        expect(response.statusCode).toBe(413);
    });
});

describe('edit-course form submission', () => {
    beforeAll(() => {
        isAuthenticated.mockImplementation(async () => { return users.instructor; });
    });

    test('valid form is accepted', async () => {
        let response = await request(app)
            .post('/edit-course?courseid=' + courses.visible._id)
            .type('form')
            .send(validCourseForm);

        expect(response.statusCode).toBe(302);
        expect(response.headers.location).toBe('courses');
    });
});
