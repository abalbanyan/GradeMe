var express = require('express');
var router =  express.Router();

router.get('/', function(req, res, next) {
    if(res.locals.user.admin === true) {
        res.render('admin');
    } else {
        res.redirect('courses');
    }
});

module.exports = router;
