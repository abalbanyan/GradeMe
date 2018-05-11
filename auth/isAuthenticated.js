const db = require('../db.js');
const getUserID = require('./getUserID.js');

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

module.exports = isAuthenticated;
