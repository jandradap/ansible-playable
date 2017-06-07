'use strict';

describe('Component: RolesComponent', function() {
  // load the controller's module
  beforeEach(module('webAppApp.roles'));

  var RolesComponent;

  // Initialize the controller and a mock scope
  beforeEach(inject(function($componentController) {
    RolesComponent = $componentController('roles', {});
  }));

  it('should ...', function() {
    expect(1).to.equal(1);
  });
});
