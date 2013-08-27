var pipeworks = require('../');

var main = pipeworks()
  .fit(function(context, next) {
    console.log('Waffle flavor:', context.flavor);
    next(context);
  })
  .fit(function(context, next) {
    if (context.flavor === 'cinnamon') {
      console.log('These waffles are *jazzy*!');
      next(context);
    } else {
      throw new Error('These waffles are _boring_!');
    }
  })
  .fit(function(context, next) {
    console.log('Thanks for breakfast!');
  });

main.fault(function(context, error, next) {
  console.log('Error caught:', error.message);
  context.flavor = 'cinnamon';
  this.flow(context);
});

main.flow({ flavor: 'plain' })
