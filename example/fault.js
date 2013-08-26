var pipeworks = require('../');

var main = pipeworks()
  .fit(function(context, next) {
    context.flavor = 'plain';
    next(context);
  })
  .fit(function(context, next) {
    throw new Error('These waffles ain\'t jazzy!');
  })
  .fit(function(context, next) {
    console.log('New flavor:', context.flavor);
  });

main.fault(function(context, error, next) {
  console.log('Error caught:', error.message);
  context.flavor = 'cinnamon';
  next(context);
});

main.flow({ flavor: null })
