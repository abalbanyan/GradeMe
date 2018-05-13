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

const checkRedirect = async (route, location) => {
    const response = await request(app).get(route);

    let resLocation = response.headers.location;
    if(location.length > 0 && location[0] !== '/')
        location = '/' + location;
    if(response.statusCode === 302 && resLocation.length > 0 && resLocation[0] !== '/')
        resLocation = '/' + resLocation;

    expect(response.statusCode).toBe(302);
    expect(resLocation).toBe(location);
};

const checkStatus = async (route, statusCode) => {
    const response = await request(app).get(route);
    expect(response.statusCode).toBe(statusCode);
}

const checkRoute = (route, userType, enrolled) => {
    let location = '/' + route.location;
    let name = route.name ? route.name : location;
    let option = route[userType];
    if(enrolled !== undefined) {
        if(enrolled) option = option.in;
        else option = option.out;
    }
    if((typeof option) === 'string') {
        test('accessing ' + name +  ' redirects to /' + option, (done) => {
            checkRedirect(location, '/' + option).then(() => {done();});
        });
    } else {
        test('accessing ' + name + ' returns status: ' + option, (done) => {
            checkStatus(location, option).then(() => {done();});
        });
    }
}

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

const createDynamicRouteTest = (name, location, adminResult, instructorResult, studentResult, loggedoutResult) => {
    let route = createRouteTest(location, adminResult, instructorResult, studentResult, loggedoutResult);
    route.name = name;
    return route;
};

const routes = [
    createRouteTest('', 'courses', 'courses', 'courses', 'login'),
    createRouteTest('admin', 200, 403, 403, 'login'),
    createRouteTest('courses', 200, 200, 200, 'login'),
    createRouteTest('create-account', 200, 200, 200, 200),
    createRouteTest('create-course', 200, 200, 403, 'login'),
    createRouteTest('enroll', 200, 200, 200, 'login'),
    createRouteTest('login', 'courses', 'courses', 'courses', 200)
];


const dynamicRoutes = [];

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

// Add route test cases
dynamicRoutes.push(createDynamicRouteTest('visible course', '/course?courseid=' + courses.visible._id, 200, {in: 200, out: 403}, {in: 200, out: 403}, 'login'));
dynamicRoutes.push(createDynamicRouteTest('non-visible course', '/course?courseid=' + courses.invisible._id, 200, {in: 200, out: 403}, 403, 'login'));

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

describe('while logged out', async () => {
    beforeAll(async () => {
        // Duplicate behavior of being logged out
        isAuthenticated.mockImplementation(async () => { return false });
    });

    for (let route of routes) {
        checkRoute(route, 'loggedout');
    }

    for(let route of dynamicRoutes) {
        checkRoute(route, 'loggedout');
    }
});

describe('while logged in as admin', async () => {
    beforeAll(() => {
        // Duplicate behavior of being logged in as admin
        isAuthenticated.mockImplementation(async () => { return users.admin; });
    });

    for (let route of routes) {
        checkRoute(route, 'admin');
    }

    for(let route of dynamicRoutes) {
        checkRoute(route, 'admin');
    }
});

describe('while logged in as instructor', async () => {
    beforeAll(() => {
        isAuthenticated.mockImplementation(async () => { return users.instructor_in; });
    });

    for (let route of routes) {
        checkRoute(route, 'instructor', true);
    }

    describe('enrolled in course', async () => {
        beforeAll(() => {
            // Duplicate behavior of being logged in as instructor
            isAuthenticated.mockImplementation(async () => { return users.instructor_in; });
        });

        for(let route of dynamicRoutes) {
            checkRoute(route, 'instructor', true);
        }
    });

    describe('not enrolled in course', async () => {
        beforeAll(() => {
            // Duplicate behavior of being logged in as instructor
            isAuthenticated.mockImplementation(async () => { return users.instructor_out; });
        });

        for(let route of dynamicRoutes) {
            checkRoute(route, 'instructor', false);
        }
    });
});

describe('while logged in as student', async () => {
    beforeAll(() => {
        // Duplicate behavior of being logged in as student
        isAuthenticated.mockImplementation(async () => { return users.student_in; });
    });

    for (let route of routes) {
        checkRoute(route, 'student', true);
    }

    describe('enrolled in course', async () => {
        beforeAll(() => {
            // Duplicate behavior of being logged in as student
            isAuthenticated.mockImplementation(async () => { return users.student_in; });
        });

        for(let route of dynamicRoutes) {
            checkRoute(route, 'student', true);
        }
    });

    describe('not enrolled in course', async () => {
        beforeAll(() => {
            // Duplicate behavior of being logged in as student
            isAuthenticated.mockImplementation(async () => { return users.student_in; });
        });

        for(let route of dynamicRoutes) {
            checkRoute(route, 'student', false);
        }
    });
});
