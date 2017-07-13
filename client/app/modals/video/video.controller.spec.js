'use strict';

describe('Controller: VideoCtrl', function() {
  // load the controller's module
  beforeEach(module('webAppApp.video'));

  var VideoCtrl;

  // Initialize the controller and a mock scope
  beforeEach(inject(function($controller) {
    VideoCtrl = $controller('VideoCtrl', {});
  }));

  it('should ...', function() {
    expect(1).to.equal(1);
  });
});
