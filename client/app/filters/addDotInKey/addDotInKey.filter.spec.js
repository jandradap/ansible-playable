'use strict';

describe('Filter: addDotInKey', function() {
  // load the filter's module
  beforeEach(module('webAppApp.addDotInKey'));

  // initialize a new instance of the filter before each test
  var addDotInKey;
  beforeEach(inject(function($filter) {
    addDotInKey = $filter('addDotInKey');
  }));

  it('should return the input prefixed with "addDotInKey filter:"', function() {
    var text = 'angularjs';
    expect(addDotInKey(text)).to.equal('addDotInKey filter: ' + text);
  });
});
