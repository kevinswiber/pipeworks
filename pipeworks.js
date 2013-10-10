var LinkedList = require('./linked_list');
var domain = require("domain");

var Pipeworks = function() {
  this.pre = [];
  this.pipes = [];
  this.post = [];

  this.state = 'fresh'; // 'fresh', 'populated', 'built'
  this.pipeline = null;
  this.next = null;
  this.linkedList = new LinkedList();

  this.faultPipe = null;
};

Pipeworks.prototype.fit = function(options, pipe) {
  if (!pipe) {
    pipe = options;
    options = {};
  }

  if (!options.affinity) {
    this.pipes.push(pipe);
  } else if (options.affinity === 'hoist') {
    this.pre.unshift(pipe);
  } else if (options.affinity === 'sink') {
    this.post.push(pipe);
  }

  if (this.state === 'fresh') {
    this.state = 'populated';
  }

  return this;
};

Pipeworks.prototype.reverse = function() {
  this.pipes = this.pipes.reverse();
  return this;
};

Pipeworks.prototype.fault = function(pipe) {
  this.faultPipe = pipe;
  return this;
};

Pipeworks.prototype.map = function() {
  if (this.next) {
    this.next.map();
  }

  var pipes = this.pre.concat(this.pipes, this.post);
  pipes = pipes.slice(0).reverse();

  var self = this;

  for(var i = 0, len = pipes.length; i < len; i++) {
    var pipe = pipes[i];
    var obj = (function(pipe) {
      return new LinkedList.Node(function(next) {
        return function() {
          var args = Array.prototype.slice.apply(arguments);
          var arity = pipe.length;
          var runner = this;

          next = next.bind(runner);

          args = self._mergeArgs(args, arity, next);
          runner.executionState = args;
          var bound = runner.domain.bind(pipe);
          bound.apply(runner, args);
        };
      });
    }(pipe));

    self.linkedList.add(obj);
  }

  return this;
};

Pipeworks.prototype._mergeArgs = function(args, arity, next) {
  if (arity === 0) { // function may be using `arguments`
    args.push(next);
    return args;
  }
  if (arity < args.length + 1) {
    args[arity - 1] = next;
  } else if (arity > args.length + 1) {
    var len = arity - 1;
    var args1 = new Array(len);

    for(var i = 0; i < len; i++) {
      if (args[i]) {
        args1[i] = args[i];
      } else {
        args1[i] = null;
      }
    }

    args1.push(next);
    args = args1;
  } else {
    args.push(next);
  }

  return args;
};

Pipeworks.prototype.build = function() {
  this.map();

  var node = this.linkedList.head();

  var reduced = new LinkedList.Node();
  reduced = node.value;
  while (node) {
    reduced = node.value(reduced);
    node = node.next;
  }
  
  this.state = 'built';
  this.pipeline = reduced;
  return this;
};

Pipeworks.prototype.flow = function() {
  if (this.state === 'populated') {
    this.build();
  }

  if (this.state === 'built') {
    var runner = new Runner(this.pipeline, this.faultPipe);
    runner.flow.apply(runner, arguments);
  };

  return this;
};

Pipeworks.prototype.join = function(pipeline) {
  var obj = this;

  if (obj.next) {
    while (obj.next) {
      obj = obj.next;
    }

    obj.join(pipeline);
    return this;
  }

  this.pipeline = null;
  this.next = pipeline;
  this.next.linkedList = this.linkedList;
  if (this.state === 'fresh') {
    this.state = 'populated';
  } else if (this.state === 'built') {
    this.build();
  }

  return this;
};

Pipeworks.prototype.siphon = function() {
  var args = Array.prototype.slice.apply(arguments);
  var rest = args.slice(0, args.length - 1);
  var next = args[args.length - 1];
  this.fit({ affinity: 'sink' }, function() {
    var args = Array.prototype.slice.apply(arguments);
    var rest = args.slice(0, args.length - 1);
    var _ = args[args.length - 1];

    if (args.length > 1) {
      next.apply(this, rest);
    } else {
      next.call(this);
    }
  });

  if (args.length > 1) {
    this.flow.apply(this, rest);
  } else {
    this.flow.call(this);
  }

  return this;
};

var Runner = function(pipeline, faultPipe) {
  this.pipeline = pipeline;
  this.faultPipe = faultPipe;
  this.executionState = null;

  this.domain = domain.create();

  var self = this;
  this.domain.on('error', function(err) {
    if (!self.faultPipe) {
      throw err; // rethrow
    }

    var state = self.executionState;
    state.splice(-1, 0, err);

    self.faultPipe.apply(self, state);
  });
};

Runner.prototype.flow = function() {
  if (!arguments.length) {
    this.pipeline.apply(this);
  } else {
    this.pipeline.apply(this, arguments);
  }
};

module.exports = function() {
  return new Pipeworks();
};
