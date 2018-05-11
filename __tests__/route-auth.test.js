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

const routes = [
    {
        name: '',
        admin: 'courses',
        instructor: 'courses',
        student: 'courses',
        loggedout: 'login'
    },
    {
        name: 'admin',
        admin: 200,
        instructor: 403,
        student: 403,
        loggedout: 'login'
    },
    {
        name: 'courses',
        admin: 200,
        instructor: 200,
        student: 200,
        loggedout: 'login'
    },
    {
        name: 'create-account',
        admin: 200,
        instructor: 200,
        student: 200,
        loggedout: 200
    },
    {
        name: 'create-assignment',
        admin: 200,
        instructor: 200,
        student: 'courses',
        loggedout: 'login'
    },
    {
        name: 'create-course',
        admin: 200,
        instructor: 200,
        student: 'courses',
        loggedout: 'login'
    },
    {
        name: 'enroll',
        admin: 200,
        instructor: 200,
        student: 200,
        loggedout: 'login'
    },
    {
        name: 'login',
        admin: 'courses',
        instructor: 'courses',
        student: 'courses',
        loggedout: 200
    }
];

let mongoServer;
let visibleCourse;
let invisibleCourse;

beforeAll(async () => {
    mongoServer = await util.mongo.start();
    await util.example.admin.save();
    await util.example.student.save();
    await util.example.instructor.save();
    await util.example.assignment.save();
    visibleCourse = new Course({
        name: 'Visible',
        desc: 'idk',
        assignments: [util.example.assignment._id],
        students: [util.example.student._id],
        instructors: [util.example.instructor._id],
        main_instructor: [util.example.instructor._id],
        visible: true
    });
    invisibleCourse = new Course({
        name: 'Invisible',
        desc: 'idk',
        assignments: [util.example.assignment._id],
        students: [util.example.student._id],
        instructors: [util.example.instructor._id],
        main_instructor: [util.example.instructor._id],
        visible: false
    });
    await visibleCourse.save();
    await invisibleCourse.save();
});

afterAll(() => {
    util.mongo.stop(mongoServer);
});

describe('while logged out', async () => {
    beforeAll(() => {
        // Duplicate behavior of being logged out
        isAuthenticated.mockImplementation(async () => { return false });
    });

    for (let route of routes) {
        // Unfortunately we need to repeat this code chunk
        // When refactored out to a function the tests don't function properly
        let name = route.name;
        let option = route.loggedout;
        if((typeof option) === 'string') {
            test('accessing /' + name +  ' redirects to /' + option, async () => {
                await checkRedirect('/' + name, '/' + option);
            });
        } else {
            test('accessing /' + name + ' returns status: ' + option, async () => {
                await checkStatus('/' + name, option);
            });
        }
    }
});

describe('while logged in as admin', async () => {
    beforeAll(() => {
        // Duplicate behavior of being logged in as admin
        isAuthenticated.mockImplementation(async () => { return util.example.admin; });
    });

    for (let route of routes) {
        let name = route.name;
        let option = route.admin;
        if((typeof option) === 'string') {
            test('accessing /' + name +  ' redirects to /' + option, async () => {
                await checkRedirect('/' + name, '/' + option);
            });
        } else {
            test('accessing /' + name + ' returns status: ' + option, async () => {
                await checkStatus('/' + name, option);
            });
        }
    }
});

describe('while logged in as instructor', async () => {
    beforeAll(() => {
        // Duplicate behavior of being logged in as instructor
        isAuthenticated.mockImplementation(async () => { return util.example.instructor; });
    });

    for (let route of routes) {
        let name = route.name;
        let option = route.instructor;
        if((typeof option) === 'string') {
            test('accessing /' + name +  ' redirects to /' + option, async () => {
                await checkRedirect('/' + name, '/' + option);
            });
        } else {
            test('accessing /' + name + ' returns status: ' + option, async () => {
                await checkStatus('/' + name, option);
            });
        }
    }
});

describe('while logged in as student', async () => {
    beforeAll(() => {
        // Duplicate behavior of being logged in as student
        isAuthenticated.mockImplementation(async () => { return util.example.student; });
    });

    for (let route of routes) {
        let name = route.name;
        let option = route.student;
        if((typeof option) === 'string') {
            test('accessing /' + name +  ' redirects to /' + option, async () => {
                await checkRedirect('/' + name, '/' + option);
            });
        } else {
            test('accessing /' + name + ' returns status: ' + option, async () => {
                await checkStatus('/' + name, option);
            });
        }
    }

    test('cannot access non-visible course', async () => {
        await checkStatus('/course?courseid=' + invisibleCourse._id, 302);
    });
});
