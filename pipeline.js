var LinkedList = require('./linked_list');

var Pipeline = module.exports = function() {
  this.pre = [];
  this.steps = [];
  this.post = [];

  this.state = 'fresh'; // 'fresh', 'populated', 'built'
  this.pipeline = null;
  this.next = null;
};

Pipeline.prototype.add = function(options, step) {
  if (!step) {
    step = options;
    options = {};
  }

  if (options.hoist) {
    this.pre.unshift(step);
  } else if (options.sink) {
    this.post.push(step);
  } else {
    this.steps.push(step);
  }

  if (this.state === 'fresh') {
    this.state = 'populated';
  }

  return this;
};

Pipeline.prototype.build = function() {
  var linkedList = new LinkedList();

  var steps = this.pre.concat(this.steps, this.post);
  steps = steps.slice(0).reverse();

  var self = this;
  steps.forEach(function(step) {
    var obj = new LinkedList.Node(function(next) {
      return function() {
        var args = Array.prototype.slice.apply(arguments);
        args.push(next);
        step.apply(self, args);
      };
    });

    linkedList.add(obj);
  });

  var node = linkedList.head();

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

Pipeline.prototype.call = function() {
  if (this.state === 'populated') {
    this.build();
  }

  if (this.state === 'built') {
    this.pipeline.apply(this, arguments);
  };
};

Pipeline.prototype.join = function(pipeline) {
  this.pipeline = null;

  var oldState = this.state;

  var self = this;
  if (pipeline && pipeline.steps) {
    var steps = pipeline.pre.concat(pipeline.steps, pipeline.post);
    self.post = self.post.concat(steps);
  }

  if (this.state === 'fresh') {
    this.state = 'populated';
  }

  if (oldState === 'built') {
    this.build();
  }

  return this;
};

Pipeline.prototype.fork = function() {
  var args = Array.prototype.slice.apply(arguments);
  var rest = args.slice(0, args.length - 1);
  var next = args[args.length - 1];
  this.add({ sink: true }, function() {
    var args = Array.prototype.slice.apply(arguments);
    var rest = args.slice(0, args.length - 1);
    var _ = args[args.length - 1];

    next.apply(this, rest);
  });

  this.call.apply(this, rest);
};
