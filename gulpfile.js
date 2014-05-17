var gulp = require('gulp');
var karma = require('karma').server;
var extend = require('lodash.assign');
var summary = require('jshint-summary');

var concat = require('gulp-concat');
var footer = require('gulp-footer');
var header = require('gulp-header');
var jshint = require('gulp-jshint');
var ngmin = require('gulp-ngmin');

var karmaConf = require('./karma.conf.js');
var CLOSURE_START = '(function() {\n\n';
var CLOSURE_END = '\n\n})();';

gulp.task('default', ['jshint', 'karma', 'build']);

gulp.task('build', function() {
  return gulp.src('src/*.js')
  .pipe(ngmin())
  .pipe(concat('hoodie.angularjs.js'))
  .pipe(header(CLOSURE_START))
  .pipe(footer(CLOSURE_END))
  .pipe(gulp.dest('dist'));
});

gulp.task('jshint', function() {
  return gulp.src('{src,test}/**/*.js')
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter(summary()))
    .pipe(jshint.reporter('fail'));
});

gulp.task('karma', function(done) {
  karma.start(extend(karmaConf, {singleRun: true}), done);
});

gulp.task('karma-watch', function(done) {
  karma.start(extend(karmaConf, {singleRun: false}), done);
});
