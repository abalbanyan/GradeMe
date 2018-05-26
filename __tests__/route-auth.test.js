// We mock isAuthentcated here so that we can easily control whether
// or not Express thinks we have access
jest.mock('../auth/isAuthenticated.js', () => {
    return jest.fn();
});

const isAuthenticated = require('../auth/isAuthenticated.js');
const request = require('supertest');
const app = require('../app.js');
const auth = require('../auth.js');
const util = require('../jest/jestutil.js');
const User = require('../models/User.js');
const Course = require('../models/Course.js');

// Check whether trying to access route redirects to location
const checkGetRedirect = async (route, location) => {
    const response = await request(app).get(route);

    let resLocation = response.headers.location;
    if(location.length > 0 && location[0] !== '/')
        location = '/' + location;
    if(response.statusCode === 302 && resLocation.length > 0 && resLocation[0] !== '/')
        resLocation = '/' + resLocation;

    expect(response.statusCode).toBe(302);
    expect(resLocation).toBe(location);
};

// Check whether trying to access route gives statusCode
const checkGetStatus = async (location, statusCode) => {
    const response = await request(app).get(location);
    expect(response.statusCode).toBe(statusCode);
}

const checkPostRedirect = async (location, formData, redirectLocation) => {
    const response = await request(app).post(location).type('form').send(formData);

    let resLocation = response.headers.location;
    if(redirectLocation.length > 0 && redirectLocation[0] !== '/')
        redirectLocation = '/' + redirectLocation;
    if(response.statusCode === 302 && resLocation.length > 0 && resLocation[0] !== '/')
        resLocation = '/' + resLocation;

    expect(response.statusCode).toBe(302);
    expect(resLocation).toBe(redirectLocation);
};

const checkPostStatus = async (location, formData, statusCode) => {
    const response = await request(app).post(location).type('form').send(formData);
    expect(response.statusCode).toBe(statusCode);
};

// Call checkRedirect or checkStatus depending on whether it is a string or a number
const checkGet = (getTest, userType, enrolled) => {
    let location = '/' + getTest.location;
    let name = getTest.name ? getTest.name : location;
    let option = getTest[userType];
    if(enrolled !== undefined) {
        if(enrolled) option = option.in;
        else option = option.out;
    }
    if((typeof option) === 'string') {
        test('accessing ' + name +  ' redirects to /' + option, (done) => {
            checkGetRedirect(location, '/' + option).then(() => {done();});
        });
    } else {
        test('accessing ' + name + ' returns status: ' + option, (done) => {
            checkGetStatus(location, option).then(() => {done();});
        });
    }
}

const checkPost = (postTest, userType, enrolled) => {
    let location = '/' + postTest.location;
    let name = postTest.name ? postTest.name : location;
    let option = postTest[userType];
    if(enrolled !== undefined) {
        if(enrolled) option = option.in;
        else option = option.out;
    }
    if((typeof option) === 'string') {
        test('sending form to ' + name +  ' redirects to /' + option, (done) => {
            checkPostRedirect(location, postTest.formData, '/' + option).then(() => {done();});
        });
    } else {
        test('sending form to ' + name + ' returns status: ' + option, (done) => {
            checkPostStatus(location, postTest.formData, option).then(() => {done();});
        });
    }
};

// Creates an object representing a route test
// For each result there are two options
//   1. A number: accessing location should return that number as the status code
//   2. A string: accessing location should redirect to the string specified
const createRouteTest = (location, adminResult, instructorResult, studentResult, loggedoutResult) => {
    if((typeof instructorResult) === 'number' || (typeof instructorResult) === 'string')
        instructorResult = {in: instructorResult, out: instructorResult};
    if((typeof studentResult) === 'number' || (typeof studentResult) === 'string')
        studentResult = {in: studentResult, out: studentResult};

    return {
        location: location,
        admin: adminResult,
        instructor: instructorResult,
        student: studentResult,
        loggedout: loggedoutResult
    };
}

const createGetTest = createRouteTest;

// Create route test, with a specified name for the test title
const createNamedTest = (name, test) => {
    test.name = name;
    return test;
};

const createPostTest = (formData, routeTest) => {
    routeTest.formData = formData;
    return routeTest;
};

// These routes retain same behavior whether user is enrolled or not
const staticGetTests = [
    createGetTest('', 'courses', 'courses', 'courses', 'login'),
    createGetTest('admin', 200, 403, 403, 'login'),
    createGetTest('courses', 200, 200, 200, 'login'),
    createGetTest('create-account', 200, 200, 200, 200),
    createGetTest('create-course', 200, 200, 403, 'login'),
    createGetTest('enroll', 200, 200, 200, 'login'),
    createGetTest('login', 'courses', 'courses', 'courses', 200),
    createGetTest('course', 404, 404, 404, 'login'),
    createNamedTest('non-existent course', createRouteTest('course?courseid=AAAAAAAAAA', 404, 404, 404, 'login')),
    createGetTest('assignment', 404, 404, 404, 'login'),
    createNamedTest('non-existent assignment', createRouteTest('assignment?assignid=AAAAAAAAAA', 404, 404, 404, 'login')),
    createGetTest('edit-course', 404, 404, 404, 'login'),
    createGetTest('edit-assignment', 404, 404, 404, 'login')
];

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

// These routes change behavior based on whether user is enrolled or not
const dynamicGetTests = [
    createNamedTest('visible course', createGetTest('course?courseid=' + courses.visible._id, 200, {in: 200, out: 403}, {in: 200, out: 403}, 'login')),
    createNamedTest('non-visible course', createGetTest('course?courseid=' + courses.invisible._id, 200, {in: 200, out: 403}, 403, 'login')),
    createNamedTest('edit visible course', createGetTest('edit-course?courseid=' + courses.visible._id, 200, {in: 200, out: 403}, 403, 'login')),
    createNamedTest('edit non-visible course', createGetTest('edit-course?courseid=' + courses.invisible._id, 200, {in: 200, out: 403}, 403, 'login')),
    createNamedTest('visible assignment', createGetTest('assignment?assignid=' + assignments.visible._id, 200, {in: 200, out: 403}, {in: 200, out:403}, 'login')),
    createNamedTest('non-visible assignment', createGetTest('assignment?assignid=' + assignments.invisible._id, 200, {in: 200, out: 403}, 403, 'login')),
    createNamedTest('edit visible assignment', createGetTest('edit-assignment?assignid=' + assignments.visible._id, 200, {in: 200, out: 403}, 403, 'login')),
    createNamedTest('edit non-visible assignment', createGetTest('edit-assignment?assignid=' + assignments.invisible._id, 200, {in: 200, out: 403}, 403, 'login'))
];

// Create valid forms to be used with POST testing
// Want them to be valid because invalid forms will be tested in another suite
const validUserForm = {};
const validAssignmentForm = {
    'name': 'Example Assignment Name',
    'desc': 'Example Assignment Description',
    'dueDate': 'Valid Date Object',
    'pointValue': 100
};
const validCourseForm = {
    'course_name': 'Example Course Name',
    'course_desc': 'Example Course Description',
    'course_visible': true
};

const staticPostTests = [
    createPostTest(validCourseForm, createRouteTest('create-course', 200, 200, 403, 'login'))
];

const dynamicPostTests = [
    createNamedTest('edit visible course', createPostTest(validCourseForm, createRouteTest('edit-course?courseid=' + courses.visible._id, 'courses', {in: 'courses', out: 403}, 403, 'login'))),
    createNamedTest('edit non-visible course', createPostTest(validCourseForm, createRouteTest('edit-course?courseid=' + courses.invisible._id, 'courses', {in: 'courses', out: 403}, 403, 'login')))
    // dynamicGetTests.push(createNamedTest('visible assignment', createPostTest('edit-assignment?assignid=' + assignments.visible._id, 200, {in: 200, out: 403}, {in: 200, out:403}, 'login'))),
    // dynamicGetTests.push(createNamedTest('non-visible assignment', createPostTest('edit-assignment?assignid=' + assignments.invisible._id, 200, {in: 200, out: 403}, 403, 'login')))
];

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

describe('while logged in as admin', async () => {
    beforeAll(() => {
        // Duplicate behavior of being logged in as admin
        isAuthenticated.mockImplementation(async () => { return users.admin; });
    });

    for (let route of staticGetTests) {
        checkGet(route, 'admin');
    }

    for(let route of dynamicGetTests) {
        checkGet(route, 'admin');
    }

    for(let route of staticPostTests) {
        checkPost(route, 'admin');
    }

    for (let route of dynamicPostTests) {
        checkPost(route, 'admin');
    }
});

describe('while logged in as instructor', async () => {
    beforeAll(() => {
        isAuthenticated.mockImplementation(async () => { return users.instructor_in; });
    });

    for (let route of staticGetTests) {
        checkGet(route, 'instructor', true);
    }

    for(let route of staticPostTests) {
        checkPost(route, 'instructor', true);
    }

    describe('enrolled in course', async () => {
        beforeAll(() => {
            // Duplicate behavior of being logged in as enrolled instructor
            isAuthenticated.mockImplementation(async () => { return users.instructor_in; });
        });

        for(let route of dynamicGetTests) {
            checkGet(route, 'instructor', true);
        }

        for(let route of dynamicPostTests) {
            checkPost(route, 'instructor', true);
        }
    });

    describe('not enrolled in course', async () => {
        beforeAll(() => {
            // Duplicate behavior of being logged in as instructor but not enrolled
            isAuthenticated.mockImplementation(async () => { return users.instructor_out; });
        });

        for(let route of dynamicGetTests) {
            checkGet(route, 'instructor', false);
        }

        for(let route of dynamicPostTests) {
            checkPost(route, 'instructor', false);
        }
    });
});

describe('while logged in as student', async () => {
    beforeAll(() => {
        // Duplicate behavior of being logged in as student
        isAuthenticated.mockImplementation(async () => { return users.student_in; });
    });

    for (let route of staticGetTests) {
        checkGet(route, 'student', true);
    }

    for(let route of staticPostTests) {
        checkPost(route, 'student', true);
    }

    describe('enrolled in course', async () => {
        beforeAll(() => {
            // Duplicate behavior of being logged in as enrolled student
            isAuthenticated.mockImplementation(async () => { return users.student_in; });
        });

        for(let route of dynamicGetTests) {
            checkGet(route, 'student', true);
        }

        for(let route of dynamicPostTests) {
            checkPost(route, 'student', true);
        }
    });

    describe('not enrolled in course', async () => {
        beforeAll(() => {
            // Duplicate behavior of being logged in as student but not enrolled
            isAuthenticated.mockImplementation(async () => { return users.student_out; });
        });

        for(let route of dynamicGetTests) {
            checkGet(route, 'student', false);
        }

        for(let route of dynamicPostTests) {
            checkPost(route, 'student', false);
        }
    });
});

describe('while logged out', async () => {
    beforeAll(async () => {
        // Duplicate behavior of being logged out
        isAuthenticated.mockImplementation(async () => { return false });
    });

    for (let route of staticGetTests) {
        checkGet(route, 'loggedout');
    }

    for(let route of dynamicGetTests) {
        checkGet(route, 'loggedout');
    }

    for(let route of staticPostTests) {
        checkPost(route, 'loggedout');
    }

    for(let route of dynamicPostTests) {
        checkPost(route, 'loggedout');
    }
});
