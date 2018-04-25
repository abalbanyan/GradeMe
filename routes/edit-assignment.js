var express = require('express');
var router =  express.Router();

router.get('/', function(req, res, next) {
    res.render('edit-assignment');
});

module.exports = router;