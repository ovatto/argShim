'use strict';

module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      all: ['src/**/*.js', 'test/**/*.js', 'Gruntfile.js'],
      gruntfile: {
        src: 'Gruntfile.js'
      },
      src: {
        src: ['src/**/*.js']
      },
      test: {
        src: ['test/**/*.js']
      }
    },
    simplemocha: {
      options: {
        ui: 'bdd',
        reporter: 'spec'
      },
      all: { src: ['test/**/*-test.js'] }
    }
  });

  grunt.loadNpmTasks('grunt-simple-mocha');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.registerTask('default', ['jshint:all', 'simplemocha']);
};
