var gulp = require('gulp'),
    gutil = require('gulp-util'),
    uglify = require('gulp-uglify'),
    babel = require('gulp-babel'),
    watchPath = require('gulp-watch-path'),
    combiner = require('stream-combiner2'),
    minifycss = require('gulp-minify-css'),
    LessAutoprefix = require('less-plugin-autoprefix'),
    autoprefix = new LessAutoprefix({ browsers: ['last 2 versions'] }),
    sourcemaps = require('gulp-sourcemaps'),
    imagemin = require('gulp-imagemin'),
    less = require('gulp-less'),
    del = require('del'),
    fileinclude = require('gulp-file-include'),
    browserSync = require('browser-sync').create(),
    cdnify = require('gulp-cdnify'),
    concat = require('gulp-concat'),
    rename = require("gulp-rename"),
    handleError = function (err) {
        var colors = gutil.colors;
        console.log('\n')
        gutil.log(colors.red('Error!'))
        gutil.log('fileName: ' + colors.red(err.fileName))
        gutil.log('lineNumber: ' + colors.red(err.lineNumber))
        gutil.log('message: ' + err.message)
        gutil.log('plugin: ' + colors.yellow(err.plugin))
    };

gulp.task('clean', function () {
    return del.sync('./dist');
});

gulp.task('html', function () {
    return gulp.src('src/pages/*.html')
    .pipe(cdnify({
        base: 'http://static.kanhunli.cn/yunxi/official/v22/v22/',
        html: {
            'img[data-src]': 'data-src'
        }
    }))
    .pipe(fileinclude())
    .pipe(rename(function (path) {
        path.extname = ".php";
    }))
    .pipe(gulp.dest('dist/pages'));
});

gulp.task('yun:html', function () {
    gulp.watch('src/pages/*.html', function () {
        gulp.src('src/pages/*.html')
        .pipe(cdnify({
            base: 'http://static.kanhunli.cn/yunxi/official/v22/v22/',
            html: {
                'img[data-src]': 'data-src'
            }
        }))
        .pipe(fileinclude())
        .pipe(gulp.dest('site/pages'));
    })
});


gulp.task('server', function () {
    browserSync.init({
        server: {
            baseDir: './dist',
            index: '/pages/index.html'
        },
        port: 9090,
        ui: {
            port: 8080
        }
    });
    // 监听 html,js,less,images
    gulp.watch('src/pages/**/*.html', ['html']).on('change', browserSync.reload);
    gulp.watch('src/js/**/*.js', ['dev:js']).on('change', browserSync.reload);
    gulp.watch('src/less/**/*.less', ['dev:less']).on('change', browserSync.reload);
});

gulp.task('dev:copy', function () {
    gulp.watch('src/static/**/*', function () {
        gulp.src('src/static/**/*')
        .pipe(gulp.dest('dist/static/'))
    })
});
gulp.task('build:copy', function () {
    gulp.src('src/static/**/*')
    .pipe(gulp.dest('dist/static/'))
});

gulp.task('yun:copy', function () {
    gulp.watch('src/static/**/*', function () {
        gulp.src('src/static/**/*')
        .pipe(gulp.dest('../site/static/'))
    })
});

gulp.task('dev:image', function () {
    gulp.watch('src/images/**/*', function (event) {
        var paths = watchPath(event,'src/','dist/');
        gutil.log(gutil.colors.green(event.type) + ' ' + paths.srcPath);
        gutil.log('Dist ' + paths.distPath);
        gulp.src(paths.srcPath)
        .pipe(imagemin({
            progressive: true
        }))
        .pipe(gulp.dest(paths.distDir))
    })
});
gulp.task('build:image', function () {
    gulp.src('src/images/**/*')
    .pipe(imagemin({
        progressive: true
    }))
    .pipe(gulp.dest('dist/images'))
});
gulp.task('yun:image', function () {
    gulp.watch('src/images/**/*', function (event) {
        var paths = watchPath(event,'src/','../site/');
        gutil.log(gutil.colors.green(event.type) + ' ' + paths.srcPath);
        gutil.log('Dist ' + paths.distPath);
        gulp.src(paths.srcPath)
        .pipe(imagemin({
            progressive: true
        }))
        .pipe(gulp.dest(paths.distDir))
    })
});


gulp.task('dev:less', function () {
    gulp.watch('src/less/**/*.less', function (event) {
        var paths = watchPath(event, 'src/less/', 'dist/css/');
        gutil.log(gutil.colors.green(event.type) + ' ' + paths.srcPath);
        gutil.log('Dist ' + paths.distPath);
        var combined = combiner.obj([
            gulp.src(paths.srcPath),
            sourcemaps.init(),
            less({
                plugins: [autoprefix]
            }),
            minifycss(),
            sourcemaps.write('./'),
            gulp.dest(paths.distDir)
        ]);
        combined.on('error', handleError)
    })
});
gulp.task('yun:less', function () {
    gulp.watch('src/less/**/*.less', function (event) {
        var paths = watchPath(event, 'src/less/', '../site/css/');
        gutil.log(gutil.colors.green(event.type) + ' ' + paths.srcPath);
        gutil.log('Dist ' + paths.distPath);
        var combined = combiner.obj([
            gulp.src(paths.srcPath),
            sourcemaps.init(),
            less({
                plugins: [autoprefix]
            }),
            minifycss(),
            sourcemaps.write('./'),
            gulp.dest(paths.distDir)
        ]);
        combined.on('error', handleError)
    })
});
gulp.task('build:less', function () {
    var combined = combiner.obj([
        gulp.src('src/less/**/*.less'),
        less({
            plugins: [autoprefix]
        }),
        //minifycss(),
        cdnify({
            base: 'http://static.kanhunli.cn/yunxi/official/v22/v22/'
        }),
        gulp.dest('dist/css/')
    ]);
    combined.on('error', handleError)
});

gulp.task('dev:js', function () {
    gulp.watch('src/js/**/*.js', function (event) {
        var paths = watchPath(event, 'src/', 'dist/');
        gutil.log(gutil.colors.green(event.type) + ' ' + paths.srcPath);
        gutil.log('Dist ' + paths.distPath);
        var combined = combiner.obj([
            gulp.src(paths.srcPath),
            sourcemaps.init(),
            babel({
                presets: ['env'], plugins: [
                    ["transform-runtime", {
                        "helpers": false,
                        "polyfill": false,
                        "regenerator": true,
                        "moduleName": "babel-runtime"
                    }]
                ] }),
            uglify(),
            sourcemaps.write('./'),
            gulp.dest(paths.distDir)
        ]);
        combined.on('error', handleError)
    })
});
gulp.task('yun:js', function () {
    gulp.watch('src/js/**/*.js', function (event) {
        var paths = watchPath(event, 'src/', '../site/');
        gutil.log(gutil.colors.green(event.type) + ' ' + paths.srcPath);
        gutil.log('Dist ' + paths.distPath);
        var combined = combiner.obj([
            gulp.src(paths.srcPath),
            sourcemaps.init(),
            babel({
                presets: ['env'], plugins: [
                    ["transform-runtime", {
                        "helpers": false,
                        "polyfill": false,
                        "regenerator": true,
                        "moduleName": "babel-runtime"
                    }]
                ] }),
            uglify(),
            sourcemaps.write('./'),
            gulp.dest(paths.distDir)
        ]);
        combined.on('error', handleError)
    })
});
gulp.task('build:js', function () {
    var combined = combiner.obj([
        gulp.src('src/js/**/*.js'),
        babel({ presets: ['env'], plugins: [
                ["transform-runtime", {
                    "helpers": false,
                    "polyfill": false,
                    "regenerator": true,
                    "moduleName": "babel-runtime"
                }]
            ] }),
        //uglify(),
        gulp.dest('dist/js/')
    ]);
    combined.on('error', handleError)
});
/*

gulp.task('all:css', function () {
    return gulp.src(['src/static/bootstrap.min.css', 'src/static/aos.css', 'select2.min.css', 'slick-theme'])
    .pipe(concat('all.css'))
    .pipe(gulp.dest('dist/css/'));
});

gulp.task('all:js', function () {
    return gulp.src(['src/static/bootstrap.min.js', 'src/static/jquery.countup.min.js', 'jquery.waypoints.min.js', 'lazysizes.min.js', 'select2.min.js'])
    .pipe(concat('all.js'))
    .pipe(gulp.dest('dist/js/'));
})
*/



gulp.task('build', ['clean'/*, 'build:copy'*/, 'build:js', 'build:less'/*, 'build:image'*/, 'html']);
gulp.task('default', ['clean', 'build:copy', 'dev:copy', 'build:js', 'build:less', 'build:image', 'dev:image', 'html', 'server']);
gulp.task('dev', ['yun:html', 'yun:copy', 'yun:image', 'yun:less', 'yun:js']);