// Karma configuration
// Generated on Tue Dec 17 2013 09:35:11 GMT-0500 (EST)

module.exports = {
  basePath: '.',

  frameworks: ['jasmine'],

  files: [
    'bower_components/jquery/dist/jquery.js',
    'bower_components/hoodie/dist/hoodie.js',
    'bower_components/angular/angular.js',
    'bower_components/angular-mocks/angular-mocks.js',
    //test source files for better errors
    'src/**/*.js',
    'test/**/*.js'
  ],

  // list of files to exclude
  exclude: [],

  // test results reporter to use
  // possible values: 'dots', 'progress', 'junit', 'growl', 'coverage'
  reporters: ['progress', 'coverage'],

  preprocessors: {
    'dist/*.js': ['coverage']
  },

  coverageReporter: {
    type : 'lcov',
    dir : 'coverage/'
  },

  // web server port
  port: 9876,

  // enable / disable colors in the output (reporters and logs)
  colors: true,

  // Start these browsers, currently available:
  // - Chrome
  // - ChromeCanary
  // - Firefox
  // - Opera (has to be installed with `npm install karma-opera-launcher`)
  // - Safari (only Mac; has to be installed with `npm install karma-safari-launcher`)
  // - PhantomJS
  // - IE (only Windows; has to be installed with `npm install karma-ie-launcher`)
  browsers: ['Chrome'],

  // If browser does not capture in given timeout [ms], kill it
  captureTimeout: 60000,

  autoWatch: true,

  // Continuous Integration mode
  // if true, it capture browsers, run tests and exit
  singleRun: false
};
