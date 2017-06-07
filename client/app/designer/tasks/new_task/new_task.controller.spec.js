'use strict';

describe('Controller: NewTaskCtrl', function() {
  // load the controller's module
  beforeEach(module('webAppApp.new_task'));

  var NewTaskCtrl;

  // Initialize the controller and a mock scope
  beforeEach(inject(function($controller) {
    NewTaskCtrl = $controller('NewTaskCtrl', {});
  }));

  it('should ...', function() {
    expect(1).to.equal(1);
  });
});
