let express = require('express');
let router =  express.Router();
let db = require('../db.js');

router.get('/', function(req, res, next) {
    res.render('edit-user');
});



router.post('/', async function(req, res, next) {
    // TODO: Validate input.
    let email = req.body.email;
    let firstname = req.body.firstname;
    let lastname = req.body.lastname;

    let updateduser = req.body.password?
      { email: req.body.email,
        password: req.body.password,
        name: {first: firstname, last: lastname} } :
      { email: req.body.email,
        name: {first: firstname, last: lastname} }

    try {
      await db.User.findByIdAndUpdate(res.locals.user._id, updateduser);
      return res.redirect('courses');
    } catch (err) {
      return res.render('error', {message: 'Unable to update user settings.', error: err});
    }
});

module.exports = router;
