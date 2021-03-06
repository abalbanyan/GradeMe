// Referenced from: https://stackoverflow.com/questions/37401239/npm-run-script-node-server-js-mocha-test

var gulp = require('gulp');
var casperJs = require('gulp-casperjs');
var nodemon = require('gulp-nodemon');
var wait = require('gulp-wait');

gulp.task('nodemon', (cb) => {
  let started = false;

  return nodemon({
    script: 'server.js'
  })
    .on('start', () => {
      if (!started) {
        started = true;
        return cb();
      }
    })
    .on('restart', () => {
      console.log('restarting');
    });

});

gulp.task('test-ui', ['nodemon'], function() {
  return gulp.src('./test/ui/*.js')
    .pipe(wait(5000)) // Wait 5 seconds to give the server a chance to start up
    .pipe(casperJs())
    .once('error', function() {
        process.exit(1);
    })
    .once('end', function() {
      process.exit();
    });
});
