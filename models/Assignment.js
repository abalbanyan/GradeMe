let mongoose = require('mongoose');
let shortid = require('shortid');
let Schema = mongoose.Schema;
let ObjectId = Schema.ObjectId;

// Assignment model.
let AssignmentSchema = new Schema({
    _id: { type: String, 'default': shortid.generate },
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
module.exports = mongoose.model('Assignment', AssignmentSchema);
