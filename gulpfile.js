var gulp = require('gulp');
var HentaiApp = require('electron-connect').server.create();

gulp.task('watch', function() {
  HentaiApp.start();
});