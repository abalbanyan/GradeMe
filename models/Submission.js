let mongoose = require('mongoose');
let shortid = require('shortid');
let fileutils = require('../fileutils.js');
let Schema = mongoose.Schema;
let ObjectId = Schema.ObjectId;

// Submission model.
let SubmissionSchema = new Schema({
    _id: { type: String, 'default': shortid.generate },
    assignmentid:               { type: String, required: true },  // What assignment is this a submission for?
    userid:                     { type: String, required: true },     // Who submitted this?
    submissiondate:             { type: Date, default: Date.now }, // When was this assignment submitted?
    submissionpath:             { type: String },                  // Path to submission file.
    grade:                      { type: Number, default: null }                   // What grade did this assignment receive?
});
// Commented out, because we will store all submissions, but only grade the most recently submitted version.
// SubmissionSchema.index({ assignmentid: 1, userid: 1 }, { unique: true }); // Make the combination of assignmentid and userid unique.

/**
 * If newly created, move the submission from the /uploads folder to its proper folder.
 */
SubmissionSchema.pre('save', async function(next) {
    if (this.isNew) {
        this.submissionpath = await fileutils.createSubmission(this.submissionpath, this._id, this.assignmentid);
    }
    // TODO: Grade immediately upon submission here if enabled.
    if (this.gradeonsubmission) {
        
    }
    return next();
});

module.exports = mongoose.model('Submission', SubmissionSchema);
