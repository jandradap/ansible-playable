'use strict';

describe('Controller: NewRoleCtrl', function() {
  // load the controller's module
  beforeEach(module('webAppApp.new_role'));

  var NewRoleCtrl;

  // Initialize the controller and a mock scope
  beforeEach(inject(function($controller) {
    NewRoleCtrl = $controller('NewRoleCtrl', {});
  }));

  it('should ...', function() {
    expect(1).to.equal(1);
  });
});
