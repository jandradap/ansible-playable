'use strict';

describe('Filter: removeDotInKey', function() {
  // load the filter's module
  beforeEach(module('webAppApp.removeDotInKey'));

  // initialize a new instance of the filter before each test
  var removeDotInKey;
  beforeEach(inject(function($filter) {
    removeDotInKey = $filter('removeDotInKey');
  }));

  it('should return the input prefixed with "removeDotInKey filter:"', function() {
    var text = 'angularjs';
    expect(removeDotInKey(text)).to.equal('removeDotInKey filter: ' + text);
  });
});
