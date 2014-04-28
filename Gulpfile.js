var gulp = require('gulp'),
  jshint = require('gulp-jshint'),
  clean = require('gulp-clean'),
  uglify = require('gulp-uglify'),
  concat = require('gulp-concat'),
  karma = require('gulp-karma'),
  bump = require('gulp-bump'),
  shell = require('gulp-shell'),
  ngmin = require('gulp-ngmin');

var componentName = 'hoodie.angularjs';
var paths = {
  dist: './',
  src: 'src/**/*.js',
  test: 'test/specs/**/*.js'
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
  return gulp.src(paths.test)
    .pipe(karma({
      configFile: 'karma.conf.js',
      singleRun: true,
      browsers: ['PhantomJS']
    }));
});


gulp.task('bump-major', function () {
  gulp.src(['./bower.json','./package.json'])
    .pipe(bump({type: 'major'}))
    .pipe(gulp.dest('./'));
});

gulp.task('bump', function () {
  gulp.src(['./bower.json','./package.json'])
    .pipe(bump())
    .pipe(gulp.dest('./'));
});

gulp.task('bump-minor', function () {
  gulp.src(['./bower.json','./package.json'])
    .pipe(bump({type: 'minor'}))
    .pipe(gulp.dest('./'));
});

gulp.task('tag', ['bump', 'default'], function () {
  return gulp.src('./bower.json')
    .pipe(shell([
      //'node write-changelog.js',
      'git commit -am \'chore(release): v' + require('./bower.json').version + '\'',
      'git tag -a v' + require('./bower.json').version + ' -m \'v' + require('./bower.json').version + '\'',
      'git push origin master'
    ]));
});

gulp.task('watch', function () {
  gulp.watch(['Gulpfile.js', paths.src, paths.test], ['jshint', 'test']);
});

// Tasks
gulp.task('default', ['dev']);
gulp.task('dev', ['test', 'watch']);
gulp.task('build', ['jshint', 'test', 'scripts']);
gulp.task('test', ['karma:dev']);