var gulp = require("gulp");
var ts = require("gulp-typescript");
var rename = require('gulp-rename');
var tsProject = ts.createProject("tsconfig.json");

gulp.task("default", function () {
    return tsProject.src()
        .pipe(tsProject())
        .pipe(gulp.dest("dist/npm"));
});

gulp.task("clone", function () {
    gulp.src('./template.json')
        .pipe(rename('package.json'))
        .pipe(gulp.dest("dist/npm"));
    return gulp.src('./README.md')
        .pipe(rename('README.md'))
        .pipe(gulp.dest("dist/npm"))
});


