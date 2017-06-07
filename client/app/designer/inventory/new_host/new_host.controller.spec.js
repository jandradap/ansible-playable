'use strict';

describe('Controller: NewHostCtrl', function() {
  // load the controller's module
  beforeEach(module('webAppApp.new_host'));

  var NewHostCtrl;

  // Initialize the controller and a mock scope
  beforeEach(inject(function($controller) {
    NewHostCtrl = $controller('NewHostCtrl', {});
  }));

  it('should ...', function() {
    expect(1).to.equal(1);
  });
});
