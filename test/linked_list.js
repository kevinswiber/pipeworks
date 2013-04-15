var assert = require('assert');
var LinkedList = require('../linked_list');

describe('LinkedList#add', function() {
  it('pushes a new node to the stack', function() {
    var list = new LinkedList();
    list.add(new LinkedList.Node({ a: '1' }));
    assert.ok(list._items.length);
  });

  it('sets the last item\'s next node', function() {
    var list = new LinkedList();
    list.add(new LinkedList.Node({ a: '1' }));
    list.add(new LinkedList.Node({ a: '2' }));
    assert.ok(list.head().next);
  });
});
