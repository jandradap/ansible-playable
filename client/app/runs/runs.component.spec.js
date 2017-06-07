'use strict';

describe('Component: RunsComponent', function() {
  // load the controller's module
  beforeEach(module('webAppApp.runs'));

  var RunsComponent;

  // Initialize the controller and a mock scope
  beforeEach(inject(function($componentController) {
    RunsComponent = $componentController('runs', {});
  }));

  it('should ...', function() {
    expect(1).to.equal(1);
  });
});
