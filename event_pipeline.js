var Pipeline = require('./pipeline');

var EventPipeline = module.exports = function() {
  this.map = {};
};

// emit an event to start a pipeline execution
EventPipeline.prototype.emit = function() {
  var args = Array.prototype.slice.apply(arguments);
  var type = args[0];

  if (type === 'error') {
    var error = args[1];
    if (!('error' in this.map)) {
      throw error;
    }
  }

  if (!(type in this.map)) {
    return false;
  }

  var pipeline = this.map[type];
  pipeline.call.apply(pipeline, args.slice(1));
};

EventPipeline.prototype.on = function(type, listener) {
  if (!(type in this.map)) {
    this.map[type] = new Pipeline();
  }

  this.map[type].add(listener);
};
