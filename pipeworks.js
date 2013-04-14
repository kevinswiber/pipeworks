var LinkedList = require('./linked_list');

var Pipeworks = function() {
  this.pre = [];
  this.steps = [];
  this.post = [];

  this.state = 'fresh'; // 'fresh', 'populated', 'built'
  this.pipeline = null;
  this.next = null;
  this.linkedList = new LinkedList();
};

Pipeworks.prototype.fit = function(options, step) {
  if (!step) {
    step = options;
    options = {};
  }

  if (!options.affinity) {
    this.steps.push(step);
  } else if (options.affinity === 'hoist') {
    this.pre.unshift(step);
  } else if (options.affinity === 'sink') {
    this.post.push(step);
  }

  if (this.state === 'fresh') {
    this.state = 'populated';
  }

  return this;
};

Pipeworks.prototype.map = function() {
  if (this.next) {
    this.next.map();
  }

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

    self.linkedList.add(obj);
  });

  return this;
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
    this.pipeline.apply(this, arguments);
  };

  return this;
};

Pipeworks.prototype.join = function(pipeline) {
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

    next.apply(this, rest);
  });

  this.flow.apply(this, rest);

  return this;
};

module.exports = function() {
  return new Pipeworks();
};
