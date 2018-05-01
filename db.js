let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let ObjectId = Schema.ObjectId;

mongoose.connect(`mongodb://127.0.0.1:27017/grademe`)
    .then(() => {
        console.log('Database connection successful.');
    })
    .catch(err => {
        console.log('Database connection error.');
    });

/**
 * Notes:
 *  - A document's id is stored as _id, and is of type ObjectId.
 *  - Any course an instructor belongs to, they are an instructor for.
 *
 */

// User model.
let UserSchema = new Schema({
    email:          { type: String, required: true },
    password:       { type: String, required: true },
    instructor:     { type: Boolean, required: true },                // Is this User an instructor?
    admin:          { type: String, default: false, required: true }, // Is this User an admin?
    name:           { first: String, last: String }
});
let User = mongoose.model('User', UserSchema);

// Course model.
let CourseSchema = new Schema({
    name:                       { type: String, required: true },
    desc:                       { type: String },
    assignments:                { type: [ObjectId], required: true }, 
    students:                   { type: [ObjectId] },
    instructors:                { type: [ObjectId] },
    main_instructor:            { type: ObjectId },                  // The professor, the primary instructor who owns the course (automatically assigned to creator).
    student_enrollment_code:    { type: Number, required: true },    // Used by students to enroll in the course.
    instructor_enrollment_code: { type: Number, required: true },    // Used by instructors (e.g. TAs) to enroll in the course.
    visible:                    { type: Boolean, required: true, default: true },   // Visible to students?
});
let Course = mongoose.model('Course', CourseSchema);

// Assignment model.
let AssignmentSchema = new Schema({
    name:                       { type: String, required: true },
    desc:                       { type: String },
    spec:                       { type: String },
    visible:                    { type: Boolean, default: true},
    creation_date:              { type: Date, default: Date.now },
    grading: {
        // TODO: Update. How are we storing files?
        dockerfile:                 { type: String },
        test_cases:                 { type: String },   
        weight:                     { type: Number, default: 1, required: true }, // What is the relative weight of this assignment to other assignments?
        due_date:                   { type: Date },
        total:                      { type: Number, required: true, default: 100 }
    }
});
let Assignment = mongoose.model('Assignment', AssignmentSchema);

// Grade model.
let GradeSchema = new Schema({
    assignmentid:               { type: ObjectId, required: true },
    studentid:                  { type: ObjectId, required: true },
    grade:                      { type: Number },
});
GradeSchema.index({ assignmentid: 1, userid: 1 }, { unique: true }); // Make the combination of assignmentid and userid unique.
let Grade = mongoose.model('Grade', GradeSchema);

// TODO: How are we storing user submissions? Might need a "Submission" model.

module.exports = {
    User: User,
    Course: Course,
    Assignment: Assignment,
    Grade: Grade
}