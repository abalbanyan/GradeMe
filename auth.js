/**
 * This file is responsible for authenticating user requests
 * using JSON Web Tokens.
 *
 * TODO
 */
let jwt = require('jsonwebtoken');
let bcrypt = require('bcryptjs');
let secret = 'super-secret';
let mongoose = require('mongoose');
let db = require('./db.js');
let isAuthenticated = require('./auth/isAuthenticated.js');
let getUserID = require('./auth/getUserID.js');

/**
 * Authenticates the user, redirecting them to /login if not logged in.
 * Middleware function, to be called before every route.
 * Important: this also makes the logged-in user's information available to all routes.
 */
async function authChecker(req, res, next) {
    res.locals.path = req.path;
    let pathRegex = new RegExp(req.path);
    let emailRegex = /\/email-verification/g;
    
    if (req.path == '/login' || req.path == '/create-account' || emailRegex.exec(pathRegex) != null) {
        // Some pages don't require authentication.
        next();
    } else {
        let user = await isAuthenticated(req);
        if (user) {
            // Make user's info available to the view.
            res.locals.user = user;
            next();
        } else {
            res.redirect('/login');
        }
    }
}

/**
 * Creates and sends a jwt token to the user as a cookie.
 *
 * @param {Express Response} res
 * @param {Number} userid
 */
function sendCookie(res, userid) {
    let token = jwt.sign({id: userid}, secret, {
        expiresIn: 86400 // 24 hours.
    });
    res.cookie('access-token', token);
}

/**
 * Authenticates a user using their email and password.
 * If authentication passes, sends a cookie to the user.
 *
 * @param {Express Response} res
 * @param {String} email
 * @param {String} password - The plaintext password.
 *
 * @return {Boolean} Are the username and password valid?
 */
async function authenticateUser(res, email, password) {
    try {
        let user = await db.User.findOne({'email' : email}).exec();
        if (user === null) {
            return false;
        }
        let valid = await bcrypt.compare(password, user.password);
        if (!valid) {
            return false;
        }
        sendCookie(res, user._id);
        return true;
    } catch (err) {
        console.error(err);
        return false;
    }
}

module.exports = {
    isAuthenticated: isAuthenticated,
    authenticateUser: authenticateUser,
    sendCookie: sendCookie,
    authChecker: authChecker,
    getUserID: getUserID
}
