let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let ObjectId = Schema.ObjectId;

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

module.exports = Course;