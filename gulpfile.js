var gulp = require("gulp");
var ts = require("gulp-typescript");
var jeditor = require("gulp-json-editor");
var tsProject = ts.createProject("tsconfig.json");


gulp.task("default", function () {
    return tsProject.src()
        .pipe(tsProject())
        .pipe(gulp.dest("dist/npm"));
});

gulp.task("clone", function () {
    gulp.src('./package.json')
        .pipe(jeditor(function(json) {
            delete json['devDependencies'];
            delete json['scripts'];
            return json;
        }))
        .pipe(gulp.dest("dist/npm"));
    return gulp.src('./README.md')
        .pipe(gulp.dest("dist/npm"))
});


