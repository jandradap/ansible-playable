'use strict';

describe('Controller: SearchRoleCtrl', function() {
  // load the controller's module
  beforeEach(module('webAppApp.search_role'));

  var SearchRoleCtrl;

  // Initialize the controller and a mock scope
  beforeEach(inject(function($controller) {
    SearchRoleCtrl = $controller('SearchRoleCtrl', {});
  }));

  it('should ...', function() {
    expect(1).to.equal(1);
  });
});
