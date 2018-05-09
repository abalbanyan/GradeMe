let mongoose = require('mongoose');
let shortid = require('shortid');
let fileutils = require('../fileutils.js');
let Schema = mongoose.Schema;
let ObjectId = Schema.ObjectId;

// Assignment model.
let AssignmentSchema = new Schema({
    _id: { type: String, 'default': shortid.generate },
    name:                       { type: String, required: true },
    desc:                       { type: String }, // Short summary of what the assignment is.
    spec: {
        path: {type: String}, // Stores a pathname to the spec file.
        filetype: {type: String, enum: ['md', 'txt', 'pdf']} 
    },
    visible:                    { type: Boolean, default: true},
    creation_date:              { type: Date, default: Date.now },
    gradingenv: {
        dockerfile:             { type: String },
        makefile:               { type: String },
        testscript:             { type: String }
    },
    // submissions:                { type: [String] }, // List of student submission ids.
    duedate:                    { type: Date },
    gradetotal:                 { type: Number, required: true, default: 100 },
});
// TODO: Validate input.

AssignmentSchema.pre('save', async function(next) {
    if (this.isNew) {
        fileutils.createAssignment(this._id);
    }
    if (this.isModified('spec.path') && this.spec.path) {
        this.spec.path = await fileutils.changeSpec(this._id, this.spec.path, this.spec.filetype);
    }
    return next();
});

module.exports = mongoose.model('Assignment', AssignmentSchema);
