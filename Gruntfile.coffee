module.exports = (grunt) ->
  require('load-grunt-tasks') grunt

  grunt.initConfig
    title: 'hoodie.angularjs'

    bump:
      options:
        commitMessage: 'chore: release v%VERSION%'
        commitFiles: ['-a']
        pushTo: 'origin'

    concat:
      dist:
        src: ['src/**/*.js']
        dest: 'dist/<%= title %>.js'

    shell:
      release:
        options:
          stdout: true
        command: 'mv <%= concat.dist.dest %> ./<%= title %>.js'

    karma:
      options:
        configFile: 'karma.conf.js'
      continuous:
        browsers: ['PhantomJS']
        singleRun: true
      dev:
        background: true

     watch:
       dev:
         files: ['src/**/*.js', 'test/**/*.js']
         tasks: ['build', 'karma:dev:run']

     ngmin:
       module:
         src: ['dist/<%= title %>.js']
         dest: 'dist/<%= title %>.js'

  grunt.registerTask 'build', ['concat', 'ngmin', ]
  grunt.registerTask 'test', ['build', 'karma:continuous']
  grunt.registerTask 'dev', ['karma:dev', 'watch']
  grunt.registerTask 'release', ['test', 'shell:release', 'bump']

  grunt.registerTask 'default', 'test'
