let mongoose = require('mongoose');
let shortid = require('shortid');
let fileutils = require('../fileutils.js');
let GradingEnvironment = require('../autograder/autograder.js');
let Schema = mongoose.Schema;
let ObjectId = Schema.ObjectId;

// Assignment model.
let AssignmentSchema = new Schema({
    _id: { type: String, 'default': shortid.generate },
    name:                       { type: String, required: true },
    desc:                       { type: String }, // Short summary of what the assignment is.
    spec: {
        path: {type: String }, // Stores a pathname to the spec file.
        filetype: {type: String, default: 'pdf', enum: ['md', 'txt', 'pdf']} // TODO: Remove.
    },
    visible:                    { type: Boolean, default: true},
    creation_date:              { type: Date, default: Date.now },
    autograder:                 { type: Object }, /* autograder.GradingEnvironment */
    gradingenv: {
        // These are all pathnames.
        dockerfile:             { type: String },
        makefile:               { type: String },
        testscript:             { type: String },
        archive:                { type: String, default: 'course-data/defaults/env.tar' }
    },
    // submissions:                { type: [String] }, // List of student submission ids.
    duedate:                    { type: Date },
    gradetotal:                 { type: Number, required: true, default: 100 },
    gradeonsubmission:          { type: Boolean }
});
// TODO: Validate input.

AssignmentSchema.pre('save', async function(next) { 
    if (this.isNew) {
        await fileutils.createAssignment(this._id);
        // Copy default grading env files.
        this.gradingenv.makefile = 'course-data/' + this._id + '/Makefile';
        this.gradingenv.dockerfile = 'course-data/' + this._id + '/Dockerfile';
        this.gradingenv.testscript = 'course-data/' + this._id + '/test.sh';
        this.gradingenv.archive = fileutils.makeEnvTar(this._id);

        // Build the autograder grading environment.
        this.autograder = new GradingEnvironment(this.gradingenv.archive, this._id);
        await this.autograder.buildImage();
    }
    return next();
});

module.exports = mongoose.model('Assignment', AssignmentSchema);
