(function (require) {

    "use strict";

    var gulp        = require('gulp'),
        jade        = require('gulp-jade'),
        runSequence = require('run-sequence'),
        sass        = require('gulp-sass'),
        fs          = require('fs'),
        lazypipe    = require('lazypipe'),
        cleanCss    = require('gulp-clean-css'),
        sprite      = require('gulp-sprite-generator'),
        mainBowerFiles = require('main-bower-files'),
        $           = require('gulp-load-plugins')({
            pattern: ['gulp-*', 'del']
        });

    var srcDir = './src/',
        distDir = './dist/',
        tmpDir = '.tmp/',
        componentsDir = 'components/',
        imagesDir = 'images/',
        iconsDir = 'icons/png/',
        scriptsDir = 'scripts/',
        stylesDir = 'sass/',
        cssDir = 'css/',
        vendorDir = 'vendor/';

    var _allDirs = '**/',
        _allFilter = '*',
        _jsFilter = '*.js',
        _cssFilter = '*.css',
        _scssFilter = '*.scss',
        _jadeFilter = '*.jade',
        _imgFilter = '*.{png,jpg,jpeg}';

    var mainScript = 'main.js';

    var isDev = true;

    gulp.task('clean', function (done) {

        $.del([tmpDir, distDir + _allFilter], {dot: true}).then(function () {
            $.cache.clearAll(done);
        });
    });

    gulp.task('jade', function () {

        return gulp.src(srcDir + _jadeFilter)
            .pipe(jade({
                pretty: true
            }))
            .pipe(gulp.dest(distDir));
    });

    gulp.task('sass', function () {

        return gulp.src(srcDir + stylesDir + _scssFilter)
            .pipe(sass().on('error', sass.logError))
            .pipe(gulp.dest(distDir + cssDir));
    });

    gulp.task('assets:images', function () {

        return gulp.src([
            srcDir + imagesDir + _allDirs + _imgFilter,
            '!' + srcDir + imagesDir + iconsDir + _allDirs + _allFilter
        ]).pipe(gulp.dest(distDir + imagesDir));
    });

    gulp.task('assets:scripts', function () {

        var compress = lazypipe()
            .pipe($.sourcemaps.init)
            .pipe($.uglify)
            .pipe($.sourcemaps.write, './')
            .pipe(gulp.dest, distDir + scriptsDir);

        return gulp.src(srcDir + scriptsDir + _jsFilter)
            .pipe($.if(!isDev, compress()))
            .pipe(gulp.dest(distDir + scriptsDir));
    });

    gulp.task('assets:scripts:components', function () {

        var src = [
            srcDir + componentsDir + _allDirs + _jsFilter,
            srcDir + scriptsDir + _allDirs + _jsFilter,
            '!' + srcDir + scriptsDir + mainScript
        ];

        var compress = lazypipe()
            .pipe($.sourcemaps.init)
            .pipe($.uglify)
            .pipe($.sourcemaps.write, './')
            .pipe(gulp.dest, distDir + scriptsDir);

        return gulp.src(src)
            .pipe($.flatten())
            .pipe($.if(!isDev, compress()))
            .pipe(gulp.dest(distDir + scriptsDir));
    });

    gulp.task('assets:scripts:vendor', function () {

        var jsFilter = $.filter(_allDirs + _jsFilter, {restore: true});
        var cssFilter = $.filter(_allDirs + _cssFilter, {restore: true});

        var compress = lazypipe()
            .pipe(function () {
                return jsFilter;
            })
            .pipe($.uglify)
            .pipe(function () {
                return jsFilter.restore;
            })
            .pipe(function () {
                return cssFilter;
            })
            .pipe(cleanCss)
            .pipe(function () {
                return cssFilter.restore;
            });

        return gulp.src(mainBowerFiles())
            .pipe($.if(!isDev, compress()))
            .pipe($.size({title: "Bower"}))
            .pipe(gulp.dest(distDir + vendorDir));
    });

    gulp.task('assets:scripts:main', function () {

        var config = {
            'baseUrl': '/scripts',
            'paths': {}
        };

        var filenameRegExp, file;
        var files = fs.readdirSync(distDir + vendorDir);

        filenameRegExp = new RegExp('^(.+).js$');
        files.forEach(function (path) {
            file = path.match(filenameRegExp);

            if (file) {
                config.paths[file[1]] = "../" + vendorDir + file[1];
            }
        });

        return gulp.src([srcDir + scriptsDir + mainScript], {base: srcDir})
            .pipe($.insert.prepend('requirejs.config(' + JSON.stringify(config, null, 4) + ');' + "\r\n"))
            .pipe(gulp.dest(distDir));
    });

    gulp.task('css:clean', function () {

        var  cleanStyles = lazypipe()
            .pipe(cleanCss)
            .pipe(gulp.dest, distDir + cssDir);

        return gulp.src(distDir + cssDir + _cssFilter)
            .pipe($.if(!isDev, cleanStyles()))
            .pipe(gulp.dest(distDir + cssDir));
    });

    gulp.task('assets', function (done) {
        runSequence(
            'assets:images',
            'assets:scripts',
            'assets:scripts:components',
            'assets:scripts:vendor',
            'assets:scripts:main',
            done
        );
    });

    gulp.task('sprites', function () {

        var spriteOutput;

        spriteOutput = gulp.src(distDir + cssDir + _cssFilter)
            .pipe(sprite({
                baseUrl: srcDir + imagesDir + iconsDir,
                spriteSheetName: "sprite.png",
                spriteSheetPath: "../" + imagesDir
            }));

        spriteOutput.css
            .pipe(gulp.dest("./dist/css"));

        spriteOutput.img
            .pipe($.size({title: "Sprite -"}))
            .pipe(gulp.dest("./dist/images"));

        return spriteOutput;
    });

    gulp.task('notify-size', function () {
        gulp.src('./dist/**/*')
            .pipe($.size({title: "Project -"}))
            .pipe(gulp.dest("dist/"));
    });

    gulp.task('default', ['clean'], function (done) {
        runSequence('sass', 'jade', 'assets', 'sprites', 'css:clean', 'watch', done);
    });

    gulp.task('prod', function (done) {
        isDev = false;
        runSequence('default', done);
    });

    gulp.task('sass:update', function (done) {
        runSequence('sass', 'sprites', 'css:clean', done);
    });

    gulp.task('watch', ['notify-size'], function () {

        gulp.watch([
            srcDir + componentsDir + _allDirs +  _jadeFilter,
            srcDir +  _jadeFilter
        ], ['jade']);

        gulp.watch([
            srcDir + componentsDir + _allDirs +  _scssFilter,
            srcDir +  stylesDir + _scssFilter
        ], ['sass:update']);

        gulp.watch([
            srcDir + componentsDir + _allDirs +  _jsFilter,
            srcDir +  scriptsDir + _jsFilter
        ], ['assets']);

    });

})(require);