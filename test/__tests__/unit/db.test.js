const app = require('../../../app.js'); // This is required for certain dependencies
const util = require('../../util/jestutil.js');
const Course = require('../../../models/Course.js');
const db = require('../../../db.js');

const INVALID_ID = 'aaaa';

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
assignments.none = util.createTestAssignment('none', true);

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
courses.none = new Course({
    name: 'None',
    desc: 'idk',
    assignments: [],
    students: [],
    instructors: [users.admin._id],
    main_instructor: [users.admin._id],
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
        let user = await db.utils.getUser(INVALID_ID);
        expect(user).toEqual(null);
    });
});

describe('getCourses', () => {
    test('admin gets all courses', async () => {
        let value = await db.utils.getCourses(users.admin._id, true, true);
        expect(value).toHaveLength(Object.keys(courses).length);
    });

    test('instructor enrolled in courses', async () => {
        let value = await db.utils.getCourses(users.instructor_in._id, true, false);
        expect(value).toHaveLength(2);
    });

    test('instructor not enrolled in courses', async () => {
        let value = await db.utils.getCourses(users.instructor_out._id, true, false);
        expect(value).toHaveLength(0);
    });

    test('student enrolled in courses', async () => {
        let value = await db.utils.getCourses(users.student_in._id, false, false);
        expect(value).toHaveLength(1);
        expect(value[0]._id).toEqual(courses.visible._id);
    });

    test('student not enrolled in courses', async () => {
        let value = await db.utils.getCourses(users.student_out._id, false, false);
        expect(value).toHaveLength(0);
    });

    test('non existent instructor is not enrolled in any courses', async () => {
        let value = await db.utils.getCourses(INVALID_ID, true, false);
        expect(value).toHaveLength(0);
    });

    test('non-existent student is not enrolled in any courses', async () => {
        let value = await db.utils.getCourses(INVALID_ID, false, false);
        expect(value).toHaveLength(0);
    });
});

describe('getAssignments', () => {
    test('admin sees all assignments', async () => {
        let visibleValue = await db.utils.getAssignments(courses.visible, true, true);
        let hiddenValue = await db.utils.getAssignments(courses.visible, false, true);
        expect(visibleValue).toHaveLength(courses.visible.assignments.length);
        expect(hiddenValue).toEqual(visibleValue);
    });

    test('show all assignments', async () => {
        let value = await db.utils.getAssignments(courses.visible, true, false);
        expect(value).toHaveLength(courses.visible.assignments.length);
    });

    test('show only visible assignments', async () => {
        let value = await db.utils.getAssignments(courses.visible, false, false);
        expect(value).toHaveLength(1);
        expect(value[0]._id).toEqual(courses.visible.assignments[0]);
    });

    test('no assignments for non-existent course', async () => {
        let value = await db.utils.getAssignments(INVALID_ID, true, false);
        expect(value).toHaveLength(0);
    });
});

describe('belongsToCourse', () => {
    test('admin belongs to any course', async () => {
        let outValue = await db.utils.belongsToCourse(courses.visible._id, users.admin._id, true, true);
        let inValue = await db.utils.belongsToCourse(courses.none._id, users.admin._id, true, true);
        expect(outValue).toBe(true);
        expect(inValue).toBe(true);
    });

    test('instructor belongs to their own course', async () => {
        let value = await db.utils.belongsToCourse(courses.visible._id, users.instructor_in._id, true, false);
        expect(value).toBe(true);
    });

    test('instructor not enrolled in another course', async () => {
        let value = await db.utils.belongsToCourse(courses.visible._id, users.instructor_out._id, true, false);
        expect(value).toBe(false);
    });

    test('student belongs to their own course', async () => {
        let value = await db.utils.belongsToCourse(courses.visible._id, users.student_in._id, false, false);
        expect(value).toBe(true);
    });

    test('student not enrolled in another course', async () => {
        let value = await db.utils.belongsToCourse(courses.visible._id, users.student_out._id, false, false);
        expect(value).toBe(false);
    });

    test('non-existent student not enrolled in course', async () => {
        let value = await db.utils.belongsToCourse(courses.visible._id, INVALID_ID, false, false);
        expect(value).toBe(false);
    });

    test('non-existent course returns false', async () => {
        let value = await db.utils.belongsToCourse(INVALID_ID, users.admin._id, false, false);
        expect(value).toBe(false);
    });
});

describe('canViewAssignment', () => {
    test('admin can view any assignment', async () => {
        let visibleValue = await db.utils.canViewAssignment(assignments.visible, courses.visible, users.admin._id, true, true);
        let invisibleValue = await db.utils.canViewAssignment(assignments.invisible, courses.visible, users.admin._id, true, true);
        expect(visibleValue).toBe(true);
        expect(invisibleValue).toBe(true);
    });

    test('instructor can view all assignments of own course', async () => {
        let visibleValue = await db.utils.canViewAssignment(assignments.visible, courses.visible, users.instructor_in._id, true, false);
        let invisibleValue = await db.utils.canViewAssignment(assignments.invisible, courses.visible, users.instructor_in._id, true, false);
        expect(visibleValue).toBe(true);
        expect(invisibleValue).toBe(true);
    });

    test('instructor cannot view assignments of another course', async () => {
        let value = await db.utils.canViewAssignment(assignments.visible, courses.visible, users.instructor_out._id, true, false);
        expect(value).toBe(false);
    });

    test('student can only view visible assignments', async () => {
        let visibleValue = await db.utils.canViewAssignment(assignments.visible, courses.visible, users.student_in._id, false, false);
        let invisibleValue = await db.utils.canViewAssignment(assignments.invisible, courses.visible, users.student_in._id, false, false);
        expect(visibleValue).toBe(true);
        expect(invisibleValue).toBe(false);
    });

    test('student cannot view assignments unless enrolled', async () => {
        let visibleValue = await db.utils.canViewAssignment(assignments.visible, courses.visible, users.student_out._id, false, false);
        let invisibleValue = await db.utils.canViewAssignment(assignments.invisible, courses.visible, users.student_out._id, false, false);
        expect(visibleValue).toBe(false);
        expect(invisibleValue).toBe(false);
    });

    test('invalid instructor ID cannot view assignments', async () => {
        let value = await db.utils.canViewAssignment(assignments.visible, courses.visible, INVALID_ID, true, false);
        expect(value).toBe(false);
    });

    test('invalid student ID cannot view assignments', async () => {
        let value = await db.utils.canViewAssignment(assignments.visible, courses.visible, INVALID_ID, false, false);
        expect(value).toBe(false);
    });

    test('cannot view if assignment is not part of course', async () => {
        let value = await db.utils.canViewAssignment(assignments.none, courses.visible, users.student_in, false, false);
        expect(value).toBe(false);
    });

    test('cannot view if invalid course ID', async () => {
        let value = await db.utils.canViewAssignment(assignments.visible, INVALID_ID, users.student_in, false, false);
        expect(value).toBe(false);
    });

    test('cannot view if invalid assignment ID', async () => {
        let value = await db.utils.canViewAssignment(INVALID_ID, courses.visible, users.student_in, false, false);
        expect(value).toBe(false);
    });
});
