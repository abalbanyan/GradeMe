const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const secret = 'super-secret';

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
        console.log(err);
        return null;
    }
}

module.exports = getUserID;
