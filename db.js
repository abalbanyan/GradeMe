let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let ObjectId = Schema.ObjectId;

mongoose.connect(`mongodb://127.0.0.1:27017/grademe`)
    .then(() => {
        console.log('Database connection successful.');
    })
    .catch(err => {
        console.log('Database connection error.');
    });

/**
 * A document's id is stored as _id, and is of type ObjectId.
 */

// TODO: How are we storing user submissions? Might need a "Submission" model.

module.exports = {
    User: require('./models/User.js'),
    Course: require('./models/Course.js'),
    Assignment: require('./models/Assignment.js'),
    Grade: require('./models/Grade.js')
}