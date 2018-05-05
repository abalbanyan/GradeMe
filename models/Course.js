let mongoose = require('mongoose');
let shortid = require('shortid');
let Schema = mongoose.Schema;
let ObjectId = Schema.ObjectId;

// Course model.
let CourseSchema = new Schema({
    _id: { type: String, 'default': shortid.generate },    
    name:                       { type: String, required: true },
    desc:                       { type: String },
    assignments:                { type: [String], required: true }, 
    students:                   { type: [String] },
    instructors:                { type: [String] },
    main_instructor:            { type: String },                  // The professor, the primary instructor who owns the course (automatically assigned to creator).
    student_enrollment_code:    { type: Number, required: true },    // Used by students to enroll in the course.
    instructor_enrollment_code: { type: Number, required: true },    // Used by instructors (e.g. TAs) to enroll in the course.
    visible:                    { type: Boolean, required: true, default: true },   // Visible to students?
});
let Course = mongoose.model('Course', CourseSchema);

module.exports = Course;