'use strict';

describe('Filter: keyValueArrayToArray', function() {
  // load the filter's module
  beforeEach(module('webAppApp.keyValueArrayToArray'));

  // initialize a new instance of the filter before each test
  var keyValueArrayToArray;
  beforeEach(inject(function($filter) {
    keyValueArrayToArray = $filter('keyValueArrayToArray');
  }));

  it('should return the input prefixed with "keyValueArrayToArray filter:"', function() {
    var text = 'angularjs';
    expect(keyValueArrayToArray(text)).to.equal('keyValueArrayToArray filter: ' + text);
  });
});
