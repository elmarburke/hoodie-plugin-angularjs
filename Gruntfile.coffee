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
      options:
        banner: 'Hoodie.extend(function(hoodie) {\n'
        footer: '\n});'
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
  )

  grunt.registerTask "build", ['concat', 'karma:continuous']
  grunt.registerTask "dev", ['karma:dev:start', 'watch']
  grunt.registerTask "release", ['build', 'shell', 'bump']

  grunt.registerTask "default", "build"

