module.exports = function (grunt) {

  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    concat: {
      simple: {
        src: [
          'lib/src/**.js'
        ],
        dest: 'lib/dist/js/angular-rest-template.js'
      },
      withAsync: {
        src: [
          'lib/bower_components/async/lib/async.js',
          'lib/src/**.js'
        ],
        dest: 'lib/dist/js/angular-rest-template-with-async.js'
      },
      withNgStorage: {
        src: [
          'lib/bower_components/ngstorage/ngstorage.js',
          'lib/src/**.js'
        ],
        dest: 'lib/dist/js/angular-rest-template-with-ng-storage.js'
      },
      full: {
        src: [
          'lib/bower_components/async/lib/async.js',
          'lib/bower_components/ngstorage/ngstorage.js',
          'lib/src/**.js'
        ],
        dest: 'lib/dist/js/angular-rest-template-full.js'
      }
    },

    uglify: {
      minify: {
        files: {
          'lib/dist/js/angular-rest-template.min.js': ['lib/dist/js/angular-rest-template.js'],
          'lib/dist/js/angular-rest-template-with-async.min.js': ['lib/dist/js/angular-rest-template-with-async.js'],
          'lib/dist/js/angular-rest-template-with-ng-storage.min.js': ['lib/dist/js/angular-rest-template-with-ng-storage.js'],
          'lib/dist/js/angular-rest-template-full.min.js': ['lib/dist/js/angular-rest-template-full.js']
        }
      }
    },

    less: {
      development: {
        options: {
          paths: ['lib/assets/less']
        },
        files: {
          'lib/assets/css/style.css': 'lib/assets/less/**.less'
        }
      }
    },

    cssmin: {
      target: {
        files: {
          'lib/assets/css/style.min.css': ['lib/dist/css/style.css']
        }
      }
    },

    clean: ["lib/dist/", "lib/assets/css/"],

    watch: {
      files: ['lib/src/**', 'lib/assets/less/**', 'lib/bower_components/**', 'lib/index.html', 'lib/sample.js'],
      tasks: ['dev']
    }
  });

  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-clean');

  grunt.registerTask('dev', ['clean', 'concat', 'uglify', 'less', 'cssmin']);
  grunt.registerTask('default', ['dev']);

};