let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let ObjectId = Schema.ObjectId;

// Grade model.
let GradeSchema = new Schema({
    assignmentid:               { type: ObjectId, required: true },
    studentid:                  { type: ObjectId, required: true },
    grade:                      { type: Number },
});
GradeSchema.index({ assignmentid: 1, userid: 1 }, { unique: true }); // Make the combination of assignmentid and userid unique.
module.exports = mongoose.model('Grade', GradeSchema);
