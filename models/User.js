let mongoose = require('mongoose');
let shortid = require('shortid');
let bcrypt = require('bcryptjs');
let Schema = mongoose.Schema;
let ObjectId = Schema.ObjectId;

// User model.
let UserSchema = new Schema({
    _id: { type: String, 'default': shortid.generate },
    email:          { type: String, required: true },
    password:       { type: String, required: true },                 // Hashed.
    instructor:     { type: Boolean, required: true },                // Is this User an instructor?
    admin:          { type: Boolean, default: false, required: true }, // Is this User an admin?
    name:           { first: String, last: String },
    uid:            { type: Number, required: true }
});

// Temp User model for email verification. 
// Everything is the same as persistent User model, 
// except generated URL and enrollment codes entered at registration.
let TempUserSchema = new Schema({
    _id: { type: String },
    email:          { type: String, required: true },
    password:       { type: String, required: true },                 // Hashed.
    instructor:     { type: Boolean, required: true },                
    admin:          { type: Boolean, default: false, required: true }, 
    name:           { first: String, last: String },
    GENERATED_VERIFYING_URL: {type: String, required: true},
    enroll_codes: {type: [String], required: false},
    createdAt: {  // TTL of tempuser
        type: Date,
        expireAfterSeconds : 86400,
        default: Date.now
    },
});

/**
 * Define middleware for hashing the password before saving.
 */
UserSchema.pre('save', function(next) {
    if (!this.isModified('password')) {
        return next();
    }

    try {
        let hash = bcrypt.hashSync(this.password, 6);
        this.password = hash;
        next();
    } catch (err) {
        next(err);
    }
});

TempUserSchema.pre('save', function(next) {
    if (!this.isModified('password')) {
        return next();
    }

    try {
        let hash = bcrypt.hashSync(this.password, 6);
        this.password = hash;
        next();
    } catch (err) {
        next(err);
    }
});

module.exports = { 
    User: mongoose.model('User', UserSchema),
    TempUser: mongoose.model('TempUser', TempUserSchema)
 }
