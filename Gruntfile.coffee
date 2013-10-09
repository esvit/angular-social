path = require 'path'

# Build configurations.
module.exports = (grunt) ->
    grunt.initConfig
        # Deletes built file and temp directories.
        clean:
            working:
                src: [
                    'angular-social.*'
                    './.temp/views'
                    './.temp/'
                ]
        copy:
            styles:
                files: [
                    src: './src/styles/angular-social.css'
                    dest: './angular-social.css'
                ]
            images:
                files: [
                    src: './src/images/*'
                    dest: './.temp/'
                    flatten: true
                    expand: true
                ]

        uglify:
            # concat js files before minification
            js:
                src: ['angular-social.src.js']
                dest: 'angular-social.js'
                options:
                  sourceMap: (fileName) ->
                    fileName.replace /\.js$/, '.map'
        concat:
            # concat js files before minification
            js:
                src: ['src/scripts/*.js', './.temp/views.js']
                dest: 'angular-social.src.js'
            less:
                src: ['src/styles/*.less']
                dest: 'angular-social.less'

        imageEmbed:
            css:
                src: [ "angular-social.css" ]
                dest: "angular-social.css"
                baseDir: './'

        less:
            css:
                files:
                    'angular-social.css': 'angular-social.less'

        cssmin:
            css:
                files:
                    'angular-social.css': 'angular-social.css'

        ngTemplateCache:
            views:
                files:
                    './.temp/views.js': './src/views/**/*.html'
                options:
                    trim: './src'
                    module: 'ngSocial'

    # Register grunt tasks supplied by grunt-contrib-*.
    # Referenced in package.json.
    # https://github.com/gruntjs/grunt-contrib
    grunt.loadNpmTasks 'grunt-contrib-clean'
    grunt.loadNpmTasks 'grunt-contrib-copy'
    grunt.loadNpmTasks 'grunt-contrib-less'
    grunt.loadNpmTasks 'grunt-contrib-cssmin'
    grunt.loadNpmTasks 'grunt-contrib-uglify'
    grunt.loadNpmTasks 'grunt-contrib-concat'
    grunt.loadNpmTasks 'grunt-image-embed'


    # Register grunt tasks supplied by grunt-hustler.
    # Referenced in package.json.
    # https://github.com/CaryLandholt/grunt-hustler
    grunt.loadNpmTasks 'grunt-hustler'

    grunt.registerTask 'dev', [
        'clean'
        'ngTemplateCache'
        'concat'
        'less'
        'copy'
        'imageEmbed'
    ]
    grunt.registerTask 'default', [
        'dev'
        'uglify'
        'cssmin'
    ]
