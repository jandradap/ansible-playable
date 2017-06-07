'use strict';

describe('Filter: dictToKeyValueArraySimple', function() {
  // load the filter's module
  beforeEach(module('webAppApp.dictToKeyValueArraySimple'));

  // initialize a new instance of the filter before each test
  var dictToKeyValueArraySimple;
  beforeEach(inject(function($filter) {
    dictToKeyValueArraySimple = $filter('dictToKeyValueArraySimple');
  }));

  it('should return the input prefixed with "dictToKeyValueArraySimple filter:"', function() {
    var text = 'angularjs';
    expect(dictToKeyValueArraySimple(text)).to.equal('dictToKeyValueArraySimple filter: ' + text);
  });
});
