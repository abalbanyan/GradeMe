/**
 * Use this script to initialize the database with some sample data.
 *
 * (takes a few seconds, be patient)
 */

let db = require('./db.js');
let MongoClient = require('mongodb').MongoClient;

async function cleardb() {
    let mongo = await MongoClient.connect("mongodb://localhost:27017");
    let grademe = await mongo.db("grademe");

    for (let collection of await grademe.collections()) {
        console.log("dropping: "  + collection.collectionName);
        await collection.drop();
    }
}

// main function
(async function initdb() {
    await cleardb();

    let admin = new db.User({
        email: 'admin@grademe.edu',
        name: {first: "Joe", last: "Bruin"},
        password: 'admin',
        admin: true,
        instructor: true,
        uid: 0
    });

    let danny = new db.User({
        email: 'danny@gmail.com',
        password: 'monkey',
        instructor: false,
        admin: false,
        name: {first: "Danny", last: "Jung"},
        uid: 123456789
    });

    let test1 = new db.User({
        email: 'test1@gmail.com',
        password: 'monkey',
        instructor: false,
        admin: false,
        name: {first: "Test", last: "One"},
        uid: 133742069
    });

    let test2 = new db.User({
        email: 'test2@gmail.com',
        password: 'monkey',
        instructor: false,
        admin: false,
        name: {first: "Test", last: "Two"},
        uid: 304479543
    });

    let test3 = new db.User({
        email: 'test3@gmail.com',
        password: 'monkey',
        instructor: false,
        admin: false,
        name: {first: "Test", last: "Three"},
        uid: 567498292
    });

    let willy = new db.User({
        email: 'willy@gmail.com',
        password: 'mindi',
        instructor: true,
        name: {first: 'William', last: 'Hsiao'},
        uid: 1337
    });
    await admin.save();
    await willy.save();
    await danny.save();
    await test1.save();
    await test2.save();
    await test3.save();

    let assignment = new db.Assignment({
        name: "Project 1",
        desc: "Test Assignment",
        duedate: new Date(2020, 1, 1),
        spec: {
            path: 'specs/loremipsum.pdf',
            filetype: 'pdf'
        },
    });
    let assignment2 = new db.Assignment({
        name: "Project 2",
        desc: "Test Assignment",
        duedate: new Date(2020, 2, 2),
        spec: {
            path: 'specs/loremipsum.pdf',
            filetype: 'pdf'
        },
    });
    let assignment3 = new db.Assignment({
        name: "Project 3",
        desc: "Test Assignment",
        duedate: new Date(2021, 1, 1),
        spec: {
            path: 'specs/loremipsum.pdf',
            filetype: 'pdf'
        },
    });
    let assignment4 = new db.Assignment({
        name: "Project 4",
        desc: "Test Assignment",
        duedate: new Date(2020, 5, 4),
        spec: {
            path: 'specs/loremipsum.pdf',
            filetype: 'pdf'
        },
    });
    await assignment.save();
    await assignment2.save();
    await assignment3.save();
    await assignment4.save();

    let course = new db.Course({
        name: 'CS130 Software Engineering',
        desc: 'Course objective: Turn the student into a practicing software engineer.',
        assignments: [assignment._id],
        students: [danny._id, test1._id, test2._id, test3._id],
        instructors: [willy._id],
        main_instructor: [willy._id],
        visible: true
    });

    let course2 = new db.Course({
        name: 'CS136 Computer Security',
        desc: 'hewwo OwO',
        assignments: [],
        students: [danny._id, test1._id, test2._id, test3._id],
        instructors: [willy._id],
        main_instructor: [willy._id],
        visible: true
    });

    let tempUser = new db.TempUser({
        GENERATED_VERIFYING_URL: 'xxx',
        email: 'temp@xxx.edu',
        name: {first: "A", last: "B"},
        password: 'none',
        admin: false,
        instructor: false,
        uid: 0
    });

    await tempUser.save();

    db.TempUser.collection.createIndex({ "createdAt": 1 }, { expireAfterSeconds: db.EXPIRE_TIME_IN_SECONDS });

    await course.save();
    await course2.save();

    console.log("Database initialized with data.");
    process.exit();
})();