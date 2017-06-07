'use strict';

describe('Controller: NewInventoryCtrl', function() {
  // load the controller's module
  beforeEach(module('webAppApp.new_inventory'));

  var NewInventoryCtrl;

  // Initialize the controller and a mock scope
  beforeEach(inject(function($controller) {
    NewInventoryCtrl = $controller('NewInventoryCtrl', {});
  }));

  it('should ...', function() {
    expect(1).to.equal(1);
  });
});
