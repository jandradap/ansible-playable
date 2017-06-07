'use strict';

describe('Controller: NewModuleCtrl', function() {
  // load the controller's module
  beforeEach(module('webAppApp.new_module'));

  var NewModuleCtrl;

  // Initialize the controller and a mock scope
  beforeEach(inject(function($controller) {
    NewModuleCtrl = $controller('NewModuleCtrl', {});
  }));

  it('should ...', function() {
    expect(1).to.equal(1);
  });
});
