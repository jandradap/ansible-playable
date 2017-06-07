'use strict';

describe('Filter: keyValueArrayToDict', function() {
  // load the filter's module
  beforeEach(module('webAppApp.keyValueArrayToDict'));

  // initialize a new instance of the filter before each test
  var keyValueArrayToDict;
  beforeEach(inject(function($filter) {
    keyValueArrayToDict = $filter('keyValueArrayToDict');
  }));

  it('should return the input prefixed with "keyValueArrayToDict filter:"', function() {
    var text = 'angularjs';
    expect(keyValueArrayToDict(text)).to.equal('keyValueArrayToDict filter: ' + text);
  });
});
