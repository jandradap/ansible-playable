'use strict';

describe('Controller: NewFileCtrl', function() {
  // load the controller's module
  beforeEach(module('webAppApp.new_file'));

  var NewFileCtrl;

  // Initialize the controller and a mock scope
  beforeEach(inject(function($controller) {
    NewFileCtrl = $controller('NewFileCtrl', {});
  }));

  it('should ...', function() {
    expect(1).to.equal(1);
  });
});
