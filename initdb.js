// Use this script to initialize the database with some sample data.

let db = require('./db.js');

async function initdb() {
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
        uid: 100
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

    let assignment = new db.Assignment({
        name: "GradeMe",
        desc: "this lmao",
        duedate: new Date(2020, 1, 1),
        spec: {
            path: 'specs/loremipsum.pdf',
            filetype: 'pdf'
        },
    });
    await assignment.save();

    let course = new db.Course({
        name: 'CS130 Software Engineering',
        desc: 'idk',
        assignments: [assignment._id],
        students: [danny._id],
        instructors: [willy._id],
        main_instructor: [willy._id],
        visible: true
    });

    let course2 = new db.Course({
        name: 'CS136 Computer Security',
        desc: 'hewwo OwO',
        assignments: [assignment._id],
        students: [danny._id],
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
}

initdb().then(err => {
    if (err)
        console.error(err);
    else
        console.log("Database initialized with data.");
    process.exit();
})
