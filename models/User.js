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
}, {discriminatorKey: "kind"});

UserSchema.statics.switchKind = function (id, changes, callBack) {
    const unset = {
        GENERATED_VERIFYING_URL: undefined,
        enroll_codes: undefined,
        createdAt: undefined
    };
    return this.findOneAndUpdate({_id: id}, {$set: changes, $unset: unset}, {new: true, strict: false}, callBack);
};

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
