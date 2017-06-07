'use strict';

describe('Controller: NewGroupCtrl', function() {
  // load the controller's module
  beforeEach(module('webAppApp.new_group'));

  var NewGroupCtrl;

  // Initialize the controller and a mock scope
  beforeEach(inject(function($controller) {
    NewGroupCtrl = $controller('NewGroupCtrl', {});
  }));

  it('should ...', function() {
    expect(1).to.equal(1);
  });
});
