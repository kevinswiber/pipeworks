var pipeworks = require('../');

var breakfast = pipeworks()
  .fit(function(context, next) {
    console.log('When the flavor is:', context.flavor);
    next(context);
  })
  .fit(function(context, next) {
    if (context.flavor !== 'cinnamon') {
      throw new Error('These waffles are _boring_!\n');
    }

    console.log('Hooray! These waffles are *jazzy*!\n');
    next(context);
  })
  .fit(function(context, next) {
    console.log('Thanks for breakfast!');
  });

breakfast.fault(function(context, error, next) {
  console.log('Error!', error.message);

  if (context.flavor !== 'cinnamon') {
    context.flavor = 'cinnamon';
    this.flow(context); // recover
  }
});

breakfast.flow({ flavor: 'plain' })
