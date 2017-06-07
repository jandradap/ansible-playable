'use strict';

describe('Controller: NewPlayCtrl', function() {
  // load the controller's module
  beforeEach(module('webAppApp.new_play'));

  var NewPlayCtrl;

  // Initialize the controller and a mock scope
  beforeEach(inject(function($controller) {
    NewPlayCtrl = $controller('NewPlayCtrl', {});
  }));

  it('should ...', function() {
    expect(1).to.equal(1);
  });
});
