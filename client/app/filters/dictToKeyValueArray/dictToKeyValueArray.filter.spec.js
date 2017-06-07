'use strict';

describe('Filter: dictToKeyValueArray', function() {
  // load the filter's module
  beforeEach(module('webAppApp.dictToKeyValueArray'));

  // initialize a new instance of the filter before each test
  var dictToKeyValueArray;
  beforeEach(inject(function($filter) {
    dictToKeyValueArray = $filter('dictToKeyValueArray');
  }));

  it('should return the input prefixed with "dictToKeyValueArray filter:"', function() {
    var text = 'angularjs';
    expect(dictToKeyValueArray(text)).to.equal('dictToKeyValueArray filter: ' + text);
  });
});
