# pipeworks 

Create pipes.  Fit 'em together.  Start the flow!

With *pipeworks*, you can:

- Fit components into execution pipelines.
- Siphon the flow into branches during execution.
- Join multiple pipelines together.
- Intercept errors during execution.

[![Build Status](https://travis-ci.org/kevinswiber/pipeworks.png)](https://travis-ci.org/kevinswiber/pipeworks)

<!-- Testling has not been working lately. :(
[![browser support](http://ci.testling.com/kevinswiber/pipeworks.png)](http://ci.testling.com/kevinswiber/pipeworks)
-->

## Example

```javascript
var pipeworks = require('pipeworks');

pipeworks()
  .fit(function(context, next) {
    next(context.replace(/hot dogs/, 'tofu rolls'));
  })
  .fit(function(context, next) {
    next(context.replace(/o/g, '0')
      .replace(/e/g, '3')
      .replace(/a/g, '4')
      .replace(/l/g, '1')
      .replace(/!/, '!!11~!11!')
      .toUpperCase());
  })
  .fit(function(context, next) {
    console.log(context);
    next(context);
  })
  .flow('i bet i could eat more hot dogs than anyone!');

// Output:
// I B3T I C0U1D 34T M0R3 T0FU R011S TH4N 4NY0N3!!11~!11!
```

## Install

```bash
$ npm install pipeworks
```

## Usage

### initialize

Start by initializing a pipeline.

```javascript
var pipeworks = require('pipeworks');

var pipeline = pipeworks();
```

### pipes

Pipes are the modular component of pipeworks.  Fit pipes together to form a pipeline.

They have the following signature: `function([arguments], next)`.  Pipes can take any number of arguments you wish to pass.  However, it's common to use a single `context` variable as a record to pass state between steps in the execution pipeline.  The last parameter passed to a pipe is a reference to the next function in the pipeline.  Pipes should always end with a call to `next([arguments])`.

See below.

```javascript
var pipe = function(context, next) {
  context.scores = [25.0, 17.0, 14.7];
  next(context);
};
```

### pipeline.fit([options], pipe)

Add a pipe to the pipeline.

`options.affinity` - Either `hoist` or `sink`. Adds to the pre and post queues, respectively. Ensures a pipe gets fitted before or after the main execution pipeline.

The effect of setting the pipeline affinity to `'hoist'`:

```javascript
pipeworks()
  .fit(function(context, next) {
    console.log('Cal Naughton, Jr: Shake and bake!');
    next(context);
  })
  .fit({ affinity: 'hoist' }, function(context, next) {
    console.log('Ricky Bobby: If you ain\'t first, you\'re last!');
    next(context);
  })
  .flow({});

// Output:
// Ricky Bobby: If you ain't first, you're last!
// Cal Naughton, Jr: Shake and bake!
```

### pipeline.siphon([arguments], next)

Redirect the flow to another pipeline.

```javascript
var hijacker = pipeworks();
var main = pipeworks();

hijacker
  .fit(function(context, next) {
    context.hijacked = true;
    console.log('hijacked!');
    next(context);
  });

main
  .fit(function(context, next) {
    console.log('getting started');
    next(context);
  })
  .fit(function(context, next) {
    console.log('am i getting hijacked?');
    hijacker.siphon(context, next);
  })
  .fit(function(context, next) {
    console.log('done-zo');
    next(context);
  });

main.flow({});

// Output: 
// getting started
// am i getting hijacked?
// hijacked!
// done-zo
```

### pipeline.join(pipeline)

Link pipelines together.

```javascript
var first = pipeworks();
var second = pipeworks();
var third = pipeworks();

first
  .fit(function(context, next) {
    console.log('alpha');
    next(context);
  })
  .fit(function(context, next) {
    console.log('atlanta');
    next(context);
  });

second
  .fit(function(context, next) {
    console.log('beta');
    next(context);
  })
  .fit(function(context, next) {
    console.log('boise');
    next(context);
  });

third
  .fit(function(context, next) {
    console.log('gamma');
    next(context);
  })
  .fit(function(context, next) {
    console.log('georgetown');
    next(context);
  });

first.join(second).join(third).flow({});

// Output:
// alpha
// atlanta
// beta
// boise
// gamma
// georgetown
```

### pipeline.flow([arguments])

Send something down the pipeline!  Any number of arguments can be sent, but often there's just a single `context` object.

```javascript
pipeworks()
  .fit(function(context, next) {
    context.age = 30;
    next(context);
  })
  .fit(function(context, next) {
    console.log(context);
    next(context);
  })
  .flow({ name: 'Kevin' });

// Output:
// { name: 'Kevin', age: 30 }
```

### pipeline.fault(callback)

Handle errors during pipeline execution. Using `pipeline.fault` allows access to the current execution context when errors occur in 
the pipeline.


* `callback` -  has the signature `function([arguments], error, next)`
  *  `[arguments]` - the list of arguments sent to the currently executing pipe
  * `error` is what was thrown
  * `next` is a reference to the following pipe in the pipeline.  The `next` argument, in most cases, should not be called.

Note: It's advisable to exit the process after an uncaught exception.  Exceptions leave your application in an unknown state. 
This method uses [domains](http://nodejs.org/api/domain.html) under the hood.

```javascript
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
```

Usage Notes: Joined pipelines should be treated as new pipelines.  Use fault on the joined pipeline itself for reliability. It is possible to have different fault handlers for each pipeline when using siphon. 

Enjoy!

## License

MIT
