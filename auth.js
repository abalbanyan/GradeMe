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

/**
 * Authenticates the user, redirecting them to /login if not logged in.
 * Middleware function, to be called before every route.
 * Important: this also makes the logged-in user's information available to all routes.
 */
async function authChecker(req, res, next) {
    res.locals.path = req.path;
    if (req.path == '/login' || req.path == '/create-account') {
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
 * Returns current userid.
 */
async function getUserID(req) {
    let token = req.cookies['access-token'];
    if (!token || token == 0) {
        return null;
    }
    try {
        let decodedtoken = await jwt.verify(token, secret);
        return decodedtoken.id;
    } catch (err) {
        return null;
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
 * Checks if the user is authenticated. If so, returns the user's db entry.
 * 
 * @param {Express Request} req
 * @return {User}
 */
async function isAuthenticated(req) {
    // Check if cookie exists.
    let userid = await getUserID(req);
    if (!userid) {
        return false;
    }
    let user = await db.User.findById(userid).exec();
    return user;
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