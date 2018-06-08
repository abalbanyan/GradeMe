const jestutil = require('../../util/jestutil.js');
const User = require('../../../models/User.js');
const Assignment = require('../../../models/Assignment.js');
const Course = require('../../../models/Course.js');

let mongoServer;

beforeAll(async () => {
    mongoServer = await jestutil.mongo.start();
});

afterAll(() => {
    jestutil.mongo.stop(mongoServer);
});

test('should insert a user into the database', async () => {
    let willy = jestutil.createTestUser("instructor", "Will Hsiao");
    await willy.save();

    let user = await User.findById(willy._id).exec();
    expect(user._id).toEqual(willy._id);
});

test('should insert assignment into database', async () => {
    let assignment = jestutil.createTestAssignment(0, true);
    await assignment.save();

    let inDB = await Assignment.findById(assignment._id).exec();
    expect(inDB._id).toEqual(assignment._id);
});

test('should insert a course into the database', async () => {
    let student = jestutil.createTestUser("student", "Student");
    await student.save();
    let instructor = jestutil.createTestUser("instructor", "Will Hsiao");
    await instructor.save();
    let course = new Course({
        name: 'Visible',
        desc: 'idk',
        assignments: [],
        students: [student._id],
        instructors: [instructor._id],
        main_instructor: [instructor._id],
        visible: true
    });
    await course.save();

    let inDB = await Course.findById(course._id).exec();
    expect(inDB._id).toEqual(course._id);
});
