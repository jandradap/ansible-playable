'use strict';

describe('Component: DesignerComponent', function() {
  // load the controller's module
  beforeEach(module('webAppApp.designer'));

  var DesignerComponent;

  // Initialize the controller and a mock scope
  beforeEach(inject(function($componentController) {
    DesignerComponent = $componentController('designer', {});
  }));

  it('should ...', function() {
    expect(1).to.equal(1);
  });
});
