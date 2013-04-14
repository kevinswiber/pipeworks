var Pipeline = require('./pipeline');

var pipeline3 = new Pipeline()
  .add(function(env, next) {
    console.log('hijacked!');
    env.hijacked = true;
    next(env);
  })
  .add(function(env, next) {
    console.log('boyeeee!');
    next(env);
  });

var pipeline = new Pipeline()
  .add(function(env, next) {
    console.log('zero:', env.zero);
    env.one = '1';
    next(env);
  })
  .add(function(env, next) {
    console.log('one:', env.one);
    env.two = '2';

    pipeline3.fork(env, next);
  })
  .add(function(env, next) {
    console.log('two:', env.two);
    env.a = 'a';
    next(env);
  })

var pipeline2 = new Pipeline()
  .add(function(env, next) {
    console.log('a:', env.a);
    env.b = 'b';
    next(env);
  })
  .add(function(env, next) {
    console.log('b:', env.b);
    env.c = 'c';
    next(env);
  })
  .add(function(env, next) {
    console.log('c:', env.c);
    next(env);
  });


var map = {
  'numbers': new Pipeline(),
  'letters': new Pipeline()
};

function handle(type, options, step) {
  if (!step) {
    step = options;
    options = {};
  }

  if (!(type in map)) {
    map[type] = new Pipeline();
  }

  map[type].add(options, step);
}

handle('numbers', function(env, next) {
  console.log('zero:', env.zero);
  env.one = '1';
  next(env);
});

handle('numbers', function(env, next) {
  console.log('one:', env.one);
  env.two = '2';

  env.pipeline('rogue').fork(env, next);
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

handle('rogue', { hoist: true }, function(env, next) {
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

//pipeline.join(pipeline2).call({ zero: 0 });
