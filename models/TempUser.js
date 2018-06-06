let mongoose = require('mongoose');
let User = require('./User.js');
let Schema = mongoose.Schema;
let ObjectId = Schema.ObjectId;

// Temp User model for email verification derived from UserSchema. 
let TempUserModel = User.discriminator('TempUser', new Schema({
    GENERATED_VERIFYING_URL: {type: String, required: true},
    enroll_codes: {type: [String], required: false},
    createdAt: {  // Used for TTL of tempuser. Index for TTL is created in initdb.js.
        type: Date,
        default: Date.now
    },
}));

module.exports = TempUserModel;
