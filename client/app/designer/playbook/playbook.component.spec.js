'use strict';

describe('Component: PlaybookComponent', function() {
  // load the controller's module
  beforeEach(module('webAppApp.playbook'));

  var PlaybookComponent;

  // Initialize the controller and a mock scope
  beforeEach(inject(function($componentController) {
    PlaybookComponent = $componentController('playbook', {});
  }));

  it('should ...', function() {
    expect(1).to.equal(1);
  });
});
