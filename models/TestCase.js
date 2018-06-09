const mongoose = require('mongoose');
const shortid = require('shortid');

const TestCaseSchema = new mongoose.Schema({
    assignid: { type: String, required: true },
    name: { type: String, required: true },
    points: { type: Number, required: true },
    stdin: { type: String, default: '' },
    stdout: { type: String, default: '' }
});

module.exports = mongoose.model('TestCase', TestCaseSchema);