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
    name:           { first: String, last: String }
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

let UserModel = mongoose.model('User', UserSchema);

// Temp User model for email verification derived from UserSchema. 
let TempUserModel = UserModel.discriminator('TempUser', new Schema({
    GENERATED_VERIFYING_URL: {type: String, required: true},
    enroll_codes: {type: [String], required: false},
    createdAt: {  // TTL of tempuser
        type: Date,
        expireAfterSeconds : 86400,
        default: Date.now
    },
}));

module.exports = { 
    User: UserModel,
    TempUser: TempUserModel
 }
