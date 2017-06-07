'use strict';

describe('Filter: json2yaml', function() {
  // load the filter's module
  beforeEach(module('webAppApp.json2yaml'));

  // initialize a new instance of the filter before each test
  var json2yaml;
  beforeEach(inject(function($filter) {
    json2yaml = $filter('json2yaml');
  }));

  it('should return the input prefixed with "json2yaml filter:"', function() {
    var text = 'angularjs';
    expect(json2yaml(text)).to.equal('json2yaml filter: ' + text);
  });
});
