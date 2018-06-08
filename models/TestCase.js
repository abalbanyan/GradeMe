const mongoose = require('mongoose');
const shortid = require('shortid');

const TestCaseSchema = new mongoose.Schema({
    assignid: { type: String, required: true },
    name: { type: String, required: true },
    stdin: { type: String, required: true },
    stdout: { type: String, required: true }
});

module.exports = mongoose.model('TestCase', TestCaseSchema);