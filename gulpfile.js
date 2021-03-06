var gulp = require('gulp'),
    sass = require('gulp-ruby-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    minifycss = require('gulp-minify-css'),
    jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify'),
    imagemin = require('gulp-imagemin'),
    rename = require('gulp-rename'),
    concat = require('gulp-concat'),
    notify = require('gulp-notify'),
    cache = require('gulp-cache'),
    livereload = require('gulp-livereload'),
    minifyHTML = require('gulp-minify-html'),
    del = require('del');

var globs = {
  sass: 'app/styles/sass/styles.scss',
  css: 'app/styles/css/styles.css',
  js: 'app/scripts/main.js',
  html: 'app/index.html',
  image: 'app/assets/images/*',
  folder: [
    'dist/styles/css',
    'dist/scripts/js',
    'dist/images',
    'app/styles/css',
    'app/scripts/js',
    'app/images',
    'dist'
  ]
}

// Server
var port = 4000;
gulp.task('express', function() {
  var express = require('express');
  var app = express();
  app.use(require('connect-livereload')({port: 35729}));
  app.use(express.static(__dirname + '/dist'));
  app.listen(port, '0.0.0.0');
  console.log('Listen on http://localhost:' + port);
});

// Livereload & Notify
var tinylr;
gulp.task('livereload', function() {
  tinylr = require('tiny-lr')();
    tinylr.listen(35729);
});

function notifyLiveReload(event) {
  var fileName = require('path').relative(__dirname, event.path);

  tinylr.changed({
    body: {
      files: [fileName]
    }
  });
}

// HTML
gulp.task('html', function() {
  var opts = {
    conditionals: true,
    spare:true
  };
 
  return gulp.src(globs.html)
    .pipe(minifyHTML(opts))
    .pipe(gulp.dest(globs.folder[6]));
});

// Styles
gulp.task('styles', function() {
  return sass(globs.sass, { style: 'expanded' })
    .pipe(autoprefixer('last 2 version'))
    .pipe(gulp.dest(globs.folder[0]))
    .pipe(gulp.dest(globs.folder[3]))
    .pipe(rename({ suffix: '.min' }))
    .pipe(minifycss())
    .pipe(gulp.dest(globs.folder[0]))
    .pipe(gulp.dest(globs.folder[3]))
    .pipe(notify({ message: 'Styles task complete' }));
});

// Scripts
gulp.task('scripts', function() {
  return gulp.src(globs.js)
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter('default'))
    .pipe(concat('main.js'))
    .pipe(gulp.dest(globs.folder[1]))
    .pipe(gulp.dest(globs.folder[4]))
    .pipe(rename({ suffix: '.min' }))
    .pipe(uglify())
    .pipe(gulp.dest(globs.folder[1]))
    .pipe(gulp.dest(globs.folder[4]))
    .pipe(notify({ message: 'Scripts task complete' }));
});

// Images
gulp.task('images', function() {
  return gulp.src(globs.image)
    .pipe(cache(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true })))
    .pipe(gulp.dest(globs.folder[2]))
    .pipe(gulp.dest(globs.folder[5]))
    .pipe(notify({ message: 'Images task complete' }));
});

// Clean
gulp.task('clean', function(cb) {
    del([globs.css, globs.folder[1] + '/main.js'], cb)
});

// Watch
gulp.task('watch', function() {
  gulp.watch(globs.sass, ['styles']);
  gulp.watch(globs.js, ['scripts']);
  gulp.watch(globs.image, ['images']);
  gulp.watch(globs.html, ['html']);
  gulp.watch(globs.folder[0] + '/*', notifyLiveReload);
  gulp.watch(globs.folder[1] + '/*', notifyLiveReload);
  gulp.watch(globs.folder[2] + '/*', notifyLiveReload);
  gulp.watch(globs.folder[6] + '/*', notifyLiveReload);
});

// Default task
gulp.task('default', ['html', 'styles', 'scripts', 'images', 'express', 'livereload', 'watch', 'clean'], function() {
});