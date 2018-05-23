let mongoose = require('mongoose');
let User = require('./User.js');
let Schema = mongoose.Schema;
let ObjectId = Schema.ObjectId;

let expireTimeInSeconds = 60*60*24;  // 24 hours.

// Temp User model for email verification derived from UserSchema. 
let TempUserModel = User.discriminator('TempUser', new Schema({
    GENERATED_VERIFYING_URL: {type: String, required: true},
    enroll_codes: {type: [String], required: false},
    createdAt: {  // TTL of tempuser
        type: Date,
        expireAfterSeconds : expireTimeInSeconds,
        default: Date.now
    },
}));

TempUserModel.collection.dropIndex({"createdAt": 1});
TempUserModel.collection.createIndex({ "createdAt": 1 }, { expireAfterSeconds: expireTimeInSeconds });

module.exports = TempUserModel;
