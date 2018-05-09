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
    admin:          { type: String, default: false, required: true }, // Is this User an admin?
    name:           { first: String, last: String }
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

module.exports = mongoose.model('User', UserSchema);
