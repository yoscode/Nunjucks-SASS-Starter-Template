const { src, dest, watch, series } = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const postcss = require('gulp-postcss');
const cssnano = require('cssnano');
const terser = require('gulp-terser');
const rename = require('gulp-rename');

const nunjucksRender = require("gulp-nunjucks-render");
const through2 = require("through2");
const pretty = require("pretty");
function prettyGulp(file, enc, callback){
    file.contents = Buffer.from(pretty(file.contents.toString(), { ocd: true}));
    callback(null, file);
}
const data = require("gulp-data");

var paths = {
  dist: './dist',
  template: './src/templates',
  scss: './src/scss/',
  js: './src/js/',
  data: './src/page_data.json',
};

// Nunjucks Task
function nunjucks(){
  return src("src/templates/pages/*")
  .pipe(data(function(){
      return require(paths.data);
  }))
  .pipe(
      nunjucksRender({
          path: [paths.template],
          autoescape: false
      })
  )
  .pipe(through2.obj(prettyGulp))
  .pipe(dest(paths.dist));
}

// SCSS Task
function scssTask(){
  return src('src/scss/app.scss', { sourcemaps: true })
    .pipe(sass())
    .pipe(postcss([cssnano()]))
    .pipe(rename('app.min.css'))
    .pipe(dest('./dist/assets/css', { sourcemaps: '.' }));
}

// JavaScript Task
function jsTask(){
  return src('src/js/app.js', { sourcemaps: true })
    .pipe(terser())
    .pipe(dest('./dist/assets/js', { sourcemaps: '.' }));
}

// Watch Task
function watchTask(){
  watch(['src/scss/**/*.scss', 'src/js/**/*.js', 'src/templates/**/*.njk', , 'src/page_data.json'], series(scssTask, jsTask, nunjucks));
}

// Default Gulp task
exports.default = series(
  nunjucks,
  scssTask,
  jsTask,
  watchTask
);