let mongoose = require('mongoose');
let shortid = require('shortid');
let Schema = mongoose.Schema;
let ObjectId = Schema.ObjectId;

// Grade model.
let GradeSchema = new Schema({
    _id: { type: String, 'default': shortid.generate },    
    assignmentid:               { type: String, required: true },
    studentid:                  { type: String, required: true },
    grade:                      { type: Number },
});
GradeSchema.index({ assignmentid: 1, userid: 1 }, { unique: true }); // Make the combination of assignmentid and userid unique.
module.exports = mongoose.model('Grade', GradeSchema);
