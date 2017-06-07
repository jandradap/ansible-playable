'use strict';

describe('Controller: ExecutionCtrl', function() {
  // load the controller's module
  beforeEach(module('webAppApp.execution'));

  var ExecutionCtrl;

  // Initialize the controller and a mock scope
  beforeEach(inject(function($controller) {
    ExecutionCtrl = $controller('ExecutionCtrl', {});
  }));

  it('should ...', function() {
    expect(1).to.equal(1);
  });
});
