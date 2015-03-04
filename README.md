# brackets-coverage

![Screenshoot](https://raw.githubusercontent.com/lesion/lesion.github.com/master/resources/coverage.png "Brackets coverage")

This is a init release, if you wanna help you are more than welcome :P
Tested with brackets-karma and karma-coverage.
The extension has to found a valid .lcov file inside the project (anywhere),
so your karma.conf should be something like this:


```javascript
module.exports = function (config) {
  config.set({
    basePath: '.',
    files: ['lib/jquery.min.js', 'js/*.js', 'test/*.js],
    reporters: ['progress', 'brackets', 'coverage'],
    frameworks: ['jasmine'],
    port: 9876,
    runnerPort: 9100,
    colors: true,
    autoWatch: true,
    preprocessors: {
      'js/*.js': ['coverage']
    },
    coverageReporter: {
      dir: '.',
      reporters: [
        {
          type: 'lcovonly',
          subdir: '.',
          file: 'coverage.lcov'
        }]
    },
    browsers: ['PhantomJS'],
    captureTimeout: 60000,
    singleRun: false
  });
};
```
The preprocessors and the coverageReporter sections are the one you have to fill!
