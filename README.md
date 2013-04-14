# pipeworks 

Modularize functionality into pipes.  Fit 'em together.  Let it flow!

- Siphon into new execution pipelines at runtime.
- Join multiple pipelines together.
- Set pipe affinity on attachment.

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

Pipes are the modular component of pipeworks.  Pipes are fitted together to form a pipeline.

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

```javascript
pipeline.fit(function(context, next) {
  context.hotness = 'teh nodez';
  next(context);
});
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

first.join(second).flow({});

// Output:
// alpha
// atlanta
// beta
// boise
```

### pipeline.flow([arguments])

Send something down the pipeline!  Any number of arguments can be sent, but often there's just one.

```javascript
pipeline()
  .fit(function(context, next) {
    context.age = 30;
    next(context);
  })
  .flow({ name: 'Kevin' });
```

## License

MIT
