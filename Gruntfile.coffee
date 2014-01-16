module.exports = (grunt) ->
  require("load-grunt-tasks")(grunt)

  grunt.initConfig(
    title: "hoodie.angularjs"

    bump: 
      options: 
        commitMessage: "chore: release v%VERSION%"
        commitFiles: ['-a']
        pushTo: "upstream"

    concat:
      dist: 
        src: ['src/**/*.js']
        dest: 'dist/<%= title %>.js'

    shell:
      release:
        options: 
          stdout: true
        command: "mv <%= concat.dist.dest %> ./<%= title %>.js"

     karma: 
       options:
         configFile: 'karma.conf.js'
       continuous: 
         singleRun: true
       dev: 
         background: true
     
     watch: 
       dev: 
         files: ['src/**/*.js', 'test/**/*.js']
         tasks: ['karma:dev:run']

     ngmin:
       module:
         src: ['dist/<%= title %>.js']
         dest: 'dist/<%= title %>.js'
  )

  grunt.registerTask "build", ['concat', 'ngmin', 'karma:continuous']
  grunt.registerTask "dev", ['karma:dev:start', 'watch']
  grunt.registerTask "release", ['build', 'shell:release', 'bump']

  grunt.registerTask "default", "build"

