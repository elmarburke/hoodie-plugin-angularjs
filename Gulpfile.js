var gulp = require('gulp'),
  jshint = require('gulp-jshint'),
  clean = require('gulp-clean'),
  uglify = require('gulp-uglify'),
  concat = require('gulp-concat'),
  karma = require('gulp-karma'),
  bump = require('gulp-bump'),
  shell = require('gulp-shell'),
  ngmin = require('gulp-ngmin'),
  coveralls = require('gulp-coveralls');

var componentName = 'hoodie.angularjs';
var paths = {
  dist: './',
  src: 'src/**/*.js',
  test: 'test/**/*.js',
  testfiles: [
    'bower_components/jquery/dist/jquery.js',
    'bower_components/hoodie/dist/hoodie.js',
    'bower_components/angular/angular.js',
    'bower_components/angular-mocks/angular-mocks.js',
    'src/**/*.js',
    'test/**/*.js'
  ]
};

gulp.task('clean', function () {
  return gulp.src(paths.dist + componentName + '*.js', {read: false})
    .pipe(clean());
});

gulp.task('jshint', function () {
  return gulp.src(['Gulpfile.js', paths.src, paths.test])
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

gulp.task('scripts', [], function () {
  return gulp.src(paths.src)
    .pipe(ngmin())
    .pipe(concat(componentName + '.js'))
    .pipe(gulp.dest(paths.dist))
    .pipe(uglify())
    .pipe(concat(componentName + '.min.js'))
    .pipe(gulp.dest(paths.dist));
});

gulp.task('karma:dev', function () {
  return gulp.src(paths.testfiles)
    .pipe(karma({
      configFile: 'karma.conf.js',
      singleRun: true,
      browsers: ['PhantomJS']
    }));
});

// This is only for coveralls.io and get called by travis
// Thanks @boennemann for the support!
gulp.task('coveralls', function() {
  return gulp.src('test/coverage/**/lcov.info')
    .pipe(coveralls());
});

gulp.task('bump-major', function () {
  return gulp.src(['./bower.json', './package.json'])
    .pipe(bump({type: 'major'}))
    .pipe(gulp.dest('./'));
});

gulp.task('bump', function () {
  return gulp.src(['./bower.json', './package.json'])
    .pipe(bump())
    .pipe(gulp.dest('./'));
});

gulp.task('bump-minor', function () {
  return gulp.src(['./bower.json', './package.json'])
    .pipe(bump({type: 'minor'}))
    .pipe(gulp.dest('./'));
});

gulp.task('tag', ['build', 'bump'], function () {
  return gulp.src('./bower.json')
    .pipe(shell([
      //'node write-changelog.js',
      'git commit -am \'chore(release): v' + require('./bower.json').version + '\'',
      'git tag -a v' + require('./bower.json').version + ' -m \'v' + require('./bower.json').version + '\'',
      'git push origin master --tags'
    ]));
});

gulp.task('watch', function () {
  return gulp.watch(['Gulpfile.js', paths.src, paths.test], ['jshint', 'test']);
});

// Tasks
gulp.task('default', ['dev']);
gulp.task('dev', ['test', 'watch']);
gulp.task('build', ['jshint', 'test', 'scripts']);
gulp.task('test', ['karma:dev']);