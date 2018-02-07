var gulp = require('gulp'),
    gutil = require('gulp-util'),
    uglify = require('gulp-uglify'),
    watchPath = require('gulp-watch-path'),
    combiner = require('stream-combiner2'),
    minifycss = require('gulp-minify-css'),
    autoprefixer = require('gulp-autoprefixer'),
    sourcemaps = require('gulp-sourcemaps'),
    imagemin = require('gulp-imagemin'),
    less = require('gulp-less'),
    del = require('del'),
    fileinclude = require('gulp-file-include'),
    browserSync = require('browser-sync').create(),
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
    .pipe(fileinclude())
    .pipe(gulp.dest('dist/pages'));
});
gulp.task('server', function () {
    browserSync.init({
        server: {
            baseDir: './dist'
        },
        port: 3030
    });
    // 监听 html,js,less,images
    gulp.watch('src/pages/**/*.html', ['html']).on('change', browserSync.reload);
    gulp.watch('src/js/**/*.js', ['dev:js']).on('change', browserSync.reload);
    gulp.watch('src/less/**/*.less', ['dev:less']).on('change', browserSync.reload);
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
})

gulp.task('dev:less', function () {
    gulp.watch('src/less/**/*.less', function (event) {
        var paths = watchPath(event, 'src/less/', 'dist/css/');
        gutil.log(gutil.colors.green(event.type) + ' ' + paths.srcPath);
        gutil.log('Dist ' + paths.distPath);
        var combined = combiner.obj([
            gulp.src(paths.srcPath),
            sourcemaps.init(),
            autoprefixer({
                browsers: ['last 2 versions'],
                cascade: false
            }),
            less(),
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
        autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false
        }),
        less(),
        minifycss(),
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
        uglify(),
        gulp.dest('dist/js/')
    ]);
    combined.on('error', handleError)
});

gulp.task('build', ['clean', 'build:js', 'build:less', 'build:image', 'html']);
gulp.task('default', ['clean', 'build:js', 'build:less', 'build:image', 'dev:js', 'dev:less', 'dev:image', 'html', 'server']);