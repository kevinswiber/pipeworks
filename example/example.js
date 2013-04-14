var pipeworks = require('../pipeworks');

var numberPipe = pipeworks()
  .fit(function(env, next) {
    console.log('zero:', env.zero);
    env.one = '1';
    next(env);
  })
  .fit(function(env, next) {
    console.log('one:', env.one);
    env.two = '2';

    hijacker.siphon(env, next);
  })
  .fit(function(env, next) {
    console.log('two:', env.two);
    env.a = 'a';
    next(env);
  })

var letterPipe = pipeworks()
  .fit(function(env, next) {
    console.log('a:', env.a);
    env.b = 'b';
    next(env);
  })
  .fit(function(env, next) {
    console.log('b:', env.b);
    env.c = 'c';
    next(env);
  })
  .fit(function(env, next) {
    console.log('c:', env.c);
    next(env);
  });

var hijacker = pipeworks()
  .fit(function(env, next) {
    console.log('hijacked!');
    env.hijacked = true;
    next(env);
  })
  .fit(function(env, next) {
    console.log(env);
    next(env);
  });


numberPipe.join(letterPipe).flow({ zero: 0 });
