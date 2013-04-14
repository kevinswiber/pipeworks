# pipeworks 

Fit functions together for pipelined execution.

Modularize functionality into pipes.  Fit them together.  Then let it flow!

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

## Usage

### pipeline.fit([options], pipe)

Add a pipe to the pipeline.

### pipeline.siphon([arguments], next)

Redirect the flow to another pipeline.

### pipeline.join(pipeline)

Link pipelines together.

### pipeline.build()

Put all the pipes together and get ready to flow.
 
### pipeline.flow([arguments])

Send something down the pipeline!

## License

MIT
