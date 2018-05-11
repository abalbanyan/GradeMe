var express = require('express');
var router =  express.Router();

router.get('/', function(req, res, next) {
    if(res.locals.user.admin === true) {
        res.render('admin');
    } else {
        res.status(403);
        res.render('error', {message: "You do not have access to this page."});
    }
});

module.exports = router;
