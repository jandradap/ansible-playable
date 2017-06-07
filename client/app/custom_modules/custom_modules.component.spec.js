'use strict';

describe('Component: CustomModulesComponent', function() {
  // load the controller's module
  beforeEach(module('webAppApp.custom_modules'));

  var CustomModulesComponent;

  // Initialize the controller and a mock scope
  beforeEach(inject(function($componentController) {
    CustomModulesComponent = $componentController('custom_modules', {});
  }));

  it('should ...', function() {
    expect(1).to.equal(1);
  });
});
