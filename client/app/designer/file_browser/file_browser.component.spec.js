'use strict';

describe('Component: FileBrowserComponent', function() {
  // load the controller's module
  beforeEach(module('webAppApp.file_browser'));

  var FileBrowserComponent;

  // Initialize the controller and a mock scope
  beforeEach(inject(function($componentController) {
    FileBrowserComponent = $componentController('file_browser', {});
  }));

  it('should ...', function() {
    expect(1).to.equal(1);
  });
});
