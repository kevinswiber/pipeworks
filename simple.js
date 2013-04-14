var pipeworks = require('./pipeworks');

pipeworks()
  .fit(function(context, next) {
    next(context.replace(/hot dogs/, 'tofu rolls'));
  })
  .fit(function(context, next) {
    next(context.replace(/o/g, '0')
      .replace(/e/g, '3')
      .replace(/a/g, '4')
      .replace(/l/g, '1')
      .toUpperCase());
  })
  .fit(function(context, next) {
    console.log(context);
    next(context);
  })
  .flow('i bet i could eat more hot dogs than anyone');
