'use strict';

describe('Service: system', function() {
  // load the service's module
  beforeEach(module('webAppApp.system'));

  // instantiate service
  var system;
  beforeEach(inject(function(_system_) {
    system = _system_;
  }));

  it('should do something', function() {
    expect(!!system).to.be.true;
  });
});
