/**
 * Use this script to initialize the database with some sample data.
 */

let db = require('./db.js');

let admin = new db.User({
    email: 'admin@grademe.edu',
    password: 'admin',
    instructor: true,
});
admin.save(err => {if(err) console.error(err)});

let danny = new db.User({
    email: 'danny@gmail.com',
    password: 'monkey',
    instructor: false,
    admin: false,
    name: {first: "Danny", last: "Jung"}
});
danny.save(err => {if(err) console.error(err)});

let willy = new db.User({
    email: 'willy@gmail.com',
    password: 'mindi',
    instructor: true,
    name: {first: 'William', last: 'Hsiao'}
});
willy.save(err => {if(err) console.error(err)});

let assignment = new db.Assignment({
    name: "GradeMe",
    desc: "this lmao",
    spec: "Wes Anderson umami biodiesel YOLO, Terry Richardson helvetica tousled street art master cleanse selfies Godard cornhole 8-bit pork belly scenester. Blog blue bottle Neutra, polaroid pug cliche dreamcatcher. Ethnic wolf church-key, Wes Anderson tattooed meh tumblr direct trade literally jean shorts swag shabby chic chillwave DIY pug. Tousled lomo letterpress, flexitarian bitters Schlitz messenger bag Carles. Brooklyn shabby chic letterpress, gluten-free blog Etsy ennui umami cliche hashtag leggings hoodie bitters. Pickled scenester Austin craft beer, 3 wolf moon squid sriracha letterpress occupy. Flexitarian Odd Future semiotics, church-key lomo 8-bit ethnic artisan seitan brunch.",
    due_date: new Date(2020, 1, 1)
});
assignment.save(err => {if(err) console.error(err)});

let course = new db.Course({
    name: 'CS130 Software Engineering',
    desc: 'idk',
    assignments: [assignment._id],
    students: [danny._id],
    instructors: [willy._id],
    main_instructor: [willy._id],
    student_enrollment_code: 1337,
    instructor_enrollment_code: 420,
    visible: true 
});
course.save(err => {if(err) console.error(err)});

let grade = new db.Grade({
    assignmentid: assignment._id,
    studentid: danny._id, 
    grade: 75
});
grade.save(err => {if(err) console.error(err)});
