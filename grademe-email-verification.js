/**
 * Code originally referenced from: https://github.com/whitef0x0/node-email-verification/blob/master/index.js
 * I deleted the generateTempUserModel function because we don't need it for our purposes.
 */

'use strict';

let randtoken = require('rand-token');
let nodemailer = require('nodemailer');
let User = require('./models/User.js');
let TempUser = require('./models/TempUser.js');

module.exports = function(mongoose) {

    var isPositiveInteger = function(x) {
        return ((parseInt(x, 10) === x) && (x >= 0));
    };

    var createOptionError = function(optionName, optionValue, expectedType) {
        return new TypeError('Expected ' + optionName + ' to be a ' + expectedType + ', got ' +
            typeof optionValue);
    };

    /**
     * Retrieve a nested value of an object given a string, using dot notation.
     *
     * @func getNestedValue
     * @param {object} obj - object to retrieve the value from
     * @param {string} path - path to value
     * @param {string} def - default value to return if not found
     */
    var getNestedValue = function(obj, path, def) {
        path = path.split('.');
        for (let i = 0, len = path.length; i < len; i++) {
            if (!obj || typeof obj !== 'object') {
                return def;
            }
            obj = obj[path[i]];
        }

        if (obj === undefined) {
            return def;
        }
        return obj;
    };


    // default options
    var options = {
        verificationURL: 'http://localhost:3200/email-verification?verify=${URL}',
        URLLength: 48,

        // mongo-stuff
        persistentUserModel: User,
        tempUserModel: TempUser,
        emailFieldName: 'email',
        passwordFieldName: 'password',
        URLFieldName: 'GENERATED_VERIFYING_URL',

        // emailing options
        transportOptions: {
            service: 'Gmail',
            auth: {
                user: 'user@gmail.com',
                pass: 'password'
            }
        },
        verifyMailOptions: {
            from: 'Do Not Reply <user@gmail.com>',
            subject: 'Confirm your account',
            html: '<p>Please verify your account by clicking <a href="${URL}">this link</a> within 24 hours. If you are unable to do so, copy and ' +
                'paste the following link into your browser:</p><p>${URL}</p>',
            text: 'Please verify your account by clicking the following link, or by copying and pasting it into your browser: ${URL}'
        },
        verifySendMailCallback: function(err, info) {
            if (err) {
                throw err;
            } else {
                console.log(info.response);
            }
        },
        shouldSendConfirmation: true,
        confirmMailOptions: {
            from: 'Do Not Reply <user@gmail.com>',
            subject: 'Successfully verified!',
            html: '<p>Your account has been successfully verified.</p>',
            text: 'Your account has been successfully verified.'
        },
        confirmSendMailCallback: function(err, info) {
            if (err) {
                throw err;
            } else {
                console.log(info.response);
            }
        },
        hashingFunction: null,
    };


    var transporter;

    /**
     * Modify the default configuration.
     *
     * @func configure
     * @param {Object} o - options to be changed
     */
    var configure = function(optionsToConfigure, callback) {
        for (let key in optionsToConfigure) {
            if (optionsToConfigure.hasOwnProperty(key)) {
                options[key] = optionsToConfigure[key];
            }
        }
        transporter = nodemailer.createTransport(options.transportOptions);

        var err;

        if (typeof options.verificationURL !== 'string') {
            err = err || createOptionError('verificationURL', options.verificationURL, 'string');
        } else if (options.verificationURL.indexOf('${URL}') === -1) {
            err = err || new Error('Verification URL does not contain ${URL}');
        }

        if (typeof options.URLLength !== 'number') {
            err = err || createOptionError('URLLength', options.URLLength, 'number');
        } else if (!isPositiveInteger(options.URLLength)) {
            err = err || new Error('URLLength must be a positive integer');
        }

        if (typeof options.emailFieldName !== 'string') {
            err = err || createOptionError('emailFieldName', options.emailFieldName, 'string');
        }

        if (typeof options.passwordFieldName !== 'string') {
            err = err || createOptionError('passwordFieldName', options.passwordFieldName, 'string');
        }

        if (typeof options.URLFieldName !== 'string') {
            err = err || createOptionError('URLFieldName', options.URLFieldName, 'string');
        }

        if (err) {
            return callback(err, null);
        }

        return callback(null, options);
    };

    /**
     * Helper function for actually inserting the temporary user into the database.
     *
     * @func insertTempUser
     * @param {String} password - the user's password, possibly hashed
     * @param {TempUser} tempUser - the temporary user's data
     * @param {function} callback - a callback function, which takes an error and the
     *   temporary user object as params
     * @return {Function} returns the callback function
     */
    var insertTempUser = function(password, tempUser, callback) {
        tempUser.save(function(err, tempUser) {
            if (err) {
                return callback(err, null, null);
            }
            return callback(null, null, tempUser);
        });
    };


    /**
     * Attempt to create an instance of a temporary user based off of an instance of a
     * persistent user. If user already exists in the temporary collection, passes null
     * to the callback function; otherwise, passes the instance to the callback, with a
     * randomly generated URL associated to it.
     *
     * @func createTempUser
     * @param {Object} user - a JSON object representing data in persistent User model
     * @param {String[]} codes - an array of enroll codes
     * @param {Function} callback - a callback function that takes an error (if one exists),
     *   a persistent user (if it exists) and the new temporary user as arguments; if the
     *   temporary user already exists, then null is returned in its place
     * @return {Function} returns the callback function
     */
    var createTempUser = function(user, codes, callback) {
        if (!options.tempUserModel) {
            return callback(new TypeError('Temporary user model not defined. Either you forgot' +
                'to generate one or you did not predefine one.'), null);
        }

        // create our mongoose query
        var query = {email: user.email};

        options.persistentUserModel.findOne(query, function(err, existingPersistentUser) {
            if (err) {
                return callback(err, null, null);
            }

            // user has already signed up and confirmed their account
            if (existingPersistentUser) {
                return callback(null, existingPersistentUser, null);
            }

            options.tempUserModel.findOne(query, function(err, existingTempUser) {
                if (err) {
                    return callback(err, null, null);
                }

                // user has already signed up but not yet confirmed their account
                if (existingTempUser) {
                    return callback(null, null, null);
                } else {  // No existing tempuser, so insert new tempuser.
                    user.enroll_codes = codes;
                    user.GENERATED_VERIFYING_URL = randtoken.generate(options.URLLength);

                    let tempUser = new TempUser(user);

                    // PRE-SAVE IN User.js HANDLES HASHING PASSWORD ALREADY.
                    return insertTempUser(tempUser[options.passwordFieldName], tempUser, callback);
                }
            });
        });
    };


    /**
     * Send an email to the user requesting confirmation.
     *
     * @func sendVerificationEmail
     * @param {String} email - the user's email address.
     * @param {String} url - the unique url generated for the user.
     * @param {Function} callback - the callback to pass to Nodemailer's transporter
     */
    var sendVerificationEmail = function(email, url, callback) {
        var r = /\$\{URL\}/g;

        // inject newly-created URL into the email's body and FIRE
        // stringify --> parse is used to deep copy
        var URL = options.verificationURL.replace(r, url),
            mailOptions = JSON.parse(JSON.stringify(options.verifyMailOptions));

        mailOptions.to = email;
        mailOptions.html = mailOptions.html.replace(r, URL);
        mailOptions.text = mailOptions.text.replace(r, URL);

        if (!callback) {
            callback = options.verifySendMailCallback;
        }
        transporter.sendMail(mailOptions, callback);
    };

    /**
     * Send an email to the user requesting confirmation.
     *
     * @func sendConfirmationEmail
     * @param {String} email - the user's email address.
     * @param {Function} callback - the callback to pass to Nodemailer's transporter
     */
    var sendConfirmationEmail = function(email, callback) {
        var mailOptions = JSON.parse(JSON.stringify(options.confirmMailOptions));
        mailOptions.to = email;
        if (!callback) {
            callback = options.confirmSendMailCallback;
        }
        transporter.sendMail(mailOptions, callback);
    };

    /**
     * Transfer a temporary user from the temporary collection to the persistent
     * user collection, removing the URL assigned to it.
     *
     * @func confirmTempUser
     * @param {String} url - the randomly generated URL assigned to a unique email
     */
    var confirmTempUser = function(url, callback) {
        let TempUser = options.tempUserModel;
        let query = {};
        query[options.URLFieldName] = url;

        TempUser.findOne(query, function(err, tempUserData, codes) {
            if (err) {
                return callback(err, null, null);
            }

            // temp user is found (i.e. user accessed URL before their data expired)
            if (tempUserData) {
                let User = options.persistentUserModel;
                User.switchKind(tempUserData._id, {kind: "User"}, (err, user) => {
                    if (err) {
                        return callback(err, null, null);
                    }

                    if (options.shouldSendConfirmation) {
                        sendConfirmationEmail(user[options.emailFieldName], null);
                    }
                    return callback(null, user, tempUserData.enroll_codes);

                });

                // temp user is not found (i.e. user accessed URL after data expired, or something else...)
            } else {
                return callback(null, null, null);
            }
        });
    };


    /**
     * Resend the verification email to the user given only their email.
     *
     * @func resendVerificationEmail
     * @param {Object} email - the user's email address
     */
    var resendVerificationEmail = function(email, callback) {
        var query = {};
        query[options.emailFieldName] = email;

        options.tempUserModel.findOne(query, function(err, tempUser) {
            if (err) {
                console.log('error: ' + err);
                return callback(err, null);
            }

            // user found (i.e. user re-requested verification email before expiration)
            if (tempUser) {
                // generate new user token
                tempUser[options.URLFieldName] = randtoken.generate(options.URLLength);
                tempUser.save(function(err) {
                    if (err) {
                        return callback(err, null);
                    }

                    sendVerificationEmail(getNestedValue(tempUser, options.emailFieldName), tempUser[options.URLFieldName], function(err) {
                        if (err) {
                        console.log('error: ' + err);
                            return callback(err, null);
                        }
                        return callback(null, true);
                    });
                });

            } else {
                return callback(null, false);
            }
        });
    };


    return {
        options: options,
        configure: configure,
        createTempUser: createTempUser,
        confirmTempUser: confirmTempUser,
        resendVerificationEmail: resendVerificationEmail,
        sendConfirmationEmail: sendConfirmationEmail,
        sendVerificationEmail: sendVerificationEmail,
    };
};
