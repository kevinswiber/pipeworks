var EventPipeline = require('./event_pipeline.js');

var eventPipeline = new EventPipeline();

eventPipeline.on('first', function(env, next) {
  console.log('zero:', env.zero);
  env.one = '1';
  next(env);
});

eventPipeline.on('second', function(env, next) {
  console.log('a:', env.a);
  env.b = 'b';
  next(env);
});

eventPipeline.on('first', function(env, next) {
  console.log('one:', env.one);
  env.two = '2';
  next(env);
});

eventPipeline.on('second', function(env, next) {
  console.log('b:', env.b);
  env.c = 'c';
  next(env);
});

eventPipeline.on('first', function(env, next) {
  console.log('two:', env.two);
  next(env);
});

eventPipeline.on('second', function(env, next) {
  console.log('c:', env.c);
  next(env);
});

eventPipeline.emit('first', { zero: 0 });
eventPipeline.emit('second', { a: 'a' });
