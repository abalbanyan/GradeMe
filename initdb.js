/**
 * Use this script to initialize the database with some sample data.
 */

let db = require('./db.js');

let admin = new db.User({
    email: 'admin@grademe.edu',
    name: {first: "Joe", last: "Bruin"},
    password: 'admin',
    instructor: true,
});

let danny = new db.User({
    email: 'danny@gmail.com',
    password: 'monkey',
    instructor: false,
    admin: false,
    name: {first: "Danny", last: "Jung"}
});

let willy = new db.User({
    email: 'willy@gmail.com',
    password: 'mindi',
    instructor: true,
    name: {first: 'William', last: 'Hsiao'}
});
admin.save(err => {if(err) console.error(err)});
willy.save(err => {if(err) console.error(err)});
danny.save(err => {if(err) console.error(err)});

let assignment = new db.Assignment({
    name: "GradeMe",
    desc: "this lmao",
    duedate: new Date(2020, 1, 1),
    spec: {
        path: 'specs/loremipsum.pdf',
        filetype: 'pdf'
    },
});
assignment.save(err => {if(err) console.error(err)});

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

course.save(err => {if(err) console.error(err)});
course2.save(err => {if(err) console.error(err)});
