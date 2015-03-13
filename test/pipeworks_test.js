var assert = require('assert');
var domain = require('domain');
var pipeworks = require('../');

describe('Pipeworks#fit', function() {
  it('can accept a single pipe argument', function(done) {
    pipeworks().fit(function(next) { assert.ok(true); done(); next(); }).flow();
  });

  it('executes hoisted pipes first', function(done) {
    pipeworks()
      .fit(function(context, next) {
        context += ' matey!';
        next(context);
      })
      .fit({ affinity: 'hoist' }, function(context, next) {
        context += 'ahoy';
        next(context);
      })
      .fit(function(context, next) {
        assert.equal('ahoy matey!', context);
        done();
        next(context);
      })
      .flow('');
  });

  it('executes sunk pipes last', function(done) {
    pipeworks()
      .fit({ affinity: 'sink' }, function(context, next) {
        context += ' matey!';
        next(context);
        assert.equal('ahoy matey!', context);
        done();
      })
      .fit(function(context, next) {
        context += 'ahoy';
        next(context);
      })
      .flow('');
  });
});

describe('Pipeworks#reverse', function() {
  it('executes a main pipe in reverse', function(done) {
    pipeworks()
      .fit(function(context, next) {
        assert.equal("this is last", context);
        done();
      })
      .fit(function(context, next) {
        assert.equal("this is", context);
        context += " last";
        next(context);
      })
      .fit(function(context, next) {
        assert.equal("this", context);
        context += " is";
        next(context);
      })
      .reverse()
      .flow("this");
  });
});

describe('Pipeworks#join', function() {
  it('executes a single joined pipeline', function(done) {
    var first = pipeworks().fit(function(context, next) { context.first = true; next(context); });
    var second = pipeworks().fit(function(context, next) { assert.ok(context.first); done(); next(context); });

    first.join(second).flow({ first: false });
  });

  it('executes multiple joined pipelines', function(done) {
    var first = pipeworks().fit(function(context, next) { context.first = true; next(context); });
    var second = pipeworks().fit(function(context, next) { context.second = true; next(context); });
    var third = pipeworks().fit(function(context, next) { assert.ok(context.first && context.second); done(); next(context); });

    first.join(second).join(third).flow({ first: false, second: false });
  });

  it('passes through empty pipelines', function(done) {
    var first = pipeworks().fit(function(context, next) { context.first = true; next(context); });
    var second = pipeworks();
    var third = pipeworks().fit(function(context, next) { assert.ok(context.first); done(); next(context); });

    first.join(second).join(third).flow({ first: false });
  });

  it('rebuilds built pipelines', function(done) {
    var first = pipeworks().fit(function(context, next) { context.first = true; next(context); });
    var second = pipeworks().fit(function(context, next) { assert.ok(context.first); done(); next(context); });

    first.build().join(second).flow({ first: false });
  });
});

describe('Pipeworks#siphon', function() {
  it('delegates control of the current context to the calling pipeline', function(done) {
    var branch = pipeworks()
      .fit(function(context, next) {
        assert.ok(context.a);
        done();
        next(context);
      });

    pipeworks()
      .fit(function(context, next) {
        context.a = true;
        branch.siphon(context, next);
      })
      .flow({ a: false });
  });

  it('delegates control to the calling pipeline even when there is no context', function(done) {
    var branch = pipeworks()
      .fit(function(next) {
        assert.ok(true);
        done();
        next();
      });

    pipeworks()
      .fit(function(next) {
        branch.siphon(next);
      })
      .flow();
  });

  it('uses a new pipeline for each siphon', function(done) {
    var branch = pipeworks()
      .fit(function(context, next) {
        next(context);
      });

    var isFirstDone = false;
    var isSecondDone = false;
    var count = 0;

    var check = function(context) {
      count++;

      if (!isFirstDone && context.number === 1) {
        isFirstDone = true;
      } else if (!isSecondDone && context.number === 2) {
        isSecondDone = true;
      } else if ((context.number === 1 && isFirstDone)
        || (context.number === 2 && isSecondDone)) {
        assert.fail(context.number, 1, 'Check called twice on same number.');
      }

      if (count === 2) {
        done();
      }
    };

    var createTask = function(number) {
      return function(cb) {
        pipeworks()
          .fit(function(context, next) {
            branch.siphon(context, next);
          })
          .fit(function(context, next) {
            cb()
            next(context);
          })
          .flow({ number: number });
      };
    };

    var tasks = [1, 2].map(createTask);

    tasks.forEach(function(task, i) {
      task.call(null, function() { check({ number: i + 1 })});
    });
  });
});

describe('Pipeworks#flow', function() {
  it('sets the next argument when flow arguments are greater than the first pipe\'s arity', function(done) {
    pipeworks()
      .fit(function(next) {
        assert.ok(next);
        done();
      })
      .flow(1, 2, 3);
  });

  it('sets the next argument when flow arguments are less than the first pipe\'s arity', function(done) {
    pipeworks()
      .fit(function(a, b, c, next) {
        assert.ok(next);
        done();
      })
      .flow();
  });
});

describe('Pipeworks#fault', function() {
  it('receives errors with context', function(done) {
    pipeworks()
      .fit(function(context, next) {
        process.nextTick(function() {
          throw new Error('Ozone depleted.');
        });
      })
      .fault(function(context, error) {
        assert.equal(context.token, 'atmosphere');
        assert.equal(error.message, 'Ozone depleted.');
        done();
      })
      .flow({ token: 'atmosphere' });
  });

  it('receives errors even with no context', function(done) {
    pipeworks()
      .fit(function() {
        process.nextTick(function() {
          throw new Error('Ozone depleted.');
        });
      })
      .fault(function(error) {
        assert.equal(error.message, 'Ozone depleted.');
        done();
      })
      .flow();
  });
});
