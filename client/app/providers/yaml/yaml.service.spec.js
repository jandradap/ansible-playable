'use strict';

describe('Service: yaml', function() {
  // load the service's module
  beforeEach(module('webAppApp.yaml'));

  // instantiate service
  var yaml;
  beforeEach(inject(function(_yaml_) {
    yaml = _yaml_;
  }));

  it('should do something', function() {
    expect(!!yaml).to.be.true;
  });
});
