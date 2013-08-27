var pipeworks = require('../');

var breakfast = pipeworks()
  .fit(function(context, next) {
    process.nextTick(function() {
      if (context.flavor !== 'cinnamon') {
        throw new Error('These waffles are not *jazzy*!');
      }
    }); // simulate async I/O operation
  })
  .fit(function(context, next) {
    console.log('Thanks for breakfast!'); // never reached
  });

breakfast.fault(function(context, error) {
  console.log('Flavor on error:', context.flavor);
  console.log(error.stack);
  process.exit(); // the safe play
});

breakfast.flow({ flavor: 'plain' })
