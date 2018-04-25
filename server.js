const express = require('express');
const path = require('path');
const createError = require('http-errors');

const app = express();
const port = process.env.PORT || 3200;

app.set('views', path.join(__dirname, 'views')); // Templates are located in /views.
app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public'))); // Files in /public are staticly served.

// Include the routes.
app.use('/admin', require('./routes/admin'));
app.use('/login', require('./routes/login'));
app.use('/create-account', require('./routes/create-account'));
app.use('/enroll', require('./routes/enroll'));
app.use('/courses', require('./routes/courses'));
app.use('/create-course', require('./routes/create-course'));
app.use('/edit-course', require('./routes/edit-course'));
app.use('/course', require('./routes/course'));
app.use('/create-assignment', require('./routes/create-assignment'));
app.use('/assignment', require('./routes/assignment'));
app.use('/edit-assignment', require('./routes/edit-assignment'));

/* GET home page. */
app.get('/', function(req, res, next) {
  res.redirect('courses');
});

/* Catch 404 */
app.use(function(req, res, next) {
  next(createError(404));
});

app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  
  res.status(err.status || 500);
  res.render('error');
});

app.listen(port, () => console.log(`Listening on port ${port}`));