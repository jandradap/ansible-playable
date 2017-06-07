'use strict';

describe('Controller: NewPlaybookCtrl', function() {
  // load the controller's module
  beforeEach(module('webAppApp.new_playbook'));

  var NewPlaybookCtrl;

  // Initialize the controller and a mock scope
  beforeEach(inject(function($controller) {
    NewPlaybookCtrl = $controller('NewPlaybookCtrl', {});
  }));

  it('should ...', function() {
    expect(1).to.equal(1);
  });
});
