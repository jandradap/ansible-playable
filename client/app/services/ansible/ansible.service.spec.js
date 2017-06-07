'use strict';

describe('Service: ansible', function() {
  // load the service's module
  beforeEach(module('webAppApp.ansible'));

  // instantiate service
  var ansible;
  beforeEach(inject(function(_ansible_) {
    ansible = _ansible_;
  }));

  it('should do something', function() {
    expect(!!ansible).to.be.true;
  });
});
