'use strict';

describe('Service: customModules', function() {
  // load the service's module
  beforeEach(module('webAppApp.custom_modules'));

  // instantiate service
  var customModules;
  beforeEach(inject(function(_customModules_) {
    customModules = _customModules_;
  }));

  it('should do something', function() {
    expect(!!customModules).to.be.true;
  });
});
