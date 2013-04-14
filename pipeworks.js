var LinkedList = require('./linked_list');

var Pipeworks = function() {
  this.pre = [];
  this.pipes = [];
  this.post = [];

  this.state = 'fresh'; // 'fresh', 'populated', 'built'
  this.pipeline = null;
  this.next = null;
  this.linkedList = new LinkedList();
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

Pipeworks.prototype.map = function() {
  if (this.next) {
    this.next.map();
  }

  var pipes = this.pre.concat(this.pipes, this.post);
  pipes = pipes.slice(0).reverse();

  var self = this;
  pipes.forEach(function(pipe) {
    var obj = new LinkedList.Node(function(next) {
      return function() {
        var args = Array.prototype.slice.apply(arguments);
        if (args.length) {
          args.push(next);
          pipe.apply(self, args);
        } else {
          pipe.call(self, next);
        }
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
    if (!arguments.length) {
      this.pipeline.apply(this);
    } else {
      this.pipeline.apply(this, arguments);
    }
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

module.exports = function() {
  return new Pipeworks();
};
