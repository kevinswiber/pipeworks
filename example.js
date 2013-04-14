var pipeworks = require('./pipeworks');

var hijacker = pipeworks()
  .fit(function(env, next) {
    console.log('hijacked!');
    env.hijacked = true;
    next(env);
  })
  .fit(function(env, next) {
    console.log('boyeeee!');
    next(env);
  });

var numberPipe = pipeworks()
  .fit(function(env, next) {
    console.log('zero:', env.zero);
    env.one = '1';
    next(env);
  })
  .fit(function(env, next) {
    console.log('one:', env.one);
    env.two = '2';

    hijacker.split(env, next);
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


var map = {
  'numbers': pipeworks(),
  'letters': pipeworks()
};

function handle(type, options, step) {
  if (!step) {
    step = options;
    options = {};
  }

  if (!(type in map)) {
    map[type] = pipeworks();
  }

  map[type].fit(options, step);
}

handle('numbers', function(env, next) {
  console.log('zero:', env.zero);
  env.one = '1';
  next(env);
});

handle('numbers', function(env, next) {
  console.log('one:', env.one);
  env.two = '2';

  env.pipeline('rogue').split(env, next);
});

handle('numbers', function(env, next) {
  console.log('two:', env.two);
  env.a = 'a';
  next(env);
});

handle('letters', function(env, next) {
  console.log('a:', env.a);
  env.b = 'b';
  next(env);
});

handle('letters', function(env, next) {
  console.log('b:', env.b);
  env.c = 'c';
  next(env);
});

handle('letters', function(env, next) {
  console.log('c:', env.c);
  next(env);
});

handle('rogue', function(env, next) {
  console.log('hijacked!');
  env.hijacked = true;
  next(env);
});

handle('rogue', { affinity: 'hoist'}, function(env, next) {
  console.log('achoo!');
  next(env);
});

handle('rogue', function(env, next) {
  console.log('boyeeee!');
  next(env);
});

var getPipeline = function(name) {
  return map[name];
}

map['numbers'].join(map['letters']).call({ zero: 0, pipeline: getPipeline });

//pipeworks.join(letterPipe).call({ zero: 0 });
