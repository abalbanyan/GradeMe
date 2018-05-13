var express = require('express');
var router =  express.Router();
let db = require('../db.js');


router.get('/', async function(req, res, next) {

    if(res.locals.user.admin === true) {
        let users = await db.User.find().exec();
        res.render('admin', {
          myUsers: users
      });
    } else {
        res.status(403);
        res.render('error', {message: "You do not have access to this page."});
    }
});

module.exports = router;
