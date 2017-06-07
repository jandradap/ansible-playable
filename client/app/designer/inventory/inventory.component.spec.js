'use strict';

describe('Component: InventoryComponent', function() {
  // load the controller's module
  beforeEach(module('webAppApp.inventory'));

  var InventoryComponent;

  // Initialize the controller and a mock scope
  beforeEach(inject(function($componentController) {
    InventoryComponent = $componentController('inventory', {});
  }));

  it('should ...', function() {
    expect(1).to.equal(1);
  });
});
