'use strict';

describe('Service: editor', function() {
  // load the service's module
  beforeEach(module('webAppApp.editor'));

  // instantiate service
  var editor;
  beforeEach(inject(function(_editor_) {
    editor = _editor_;
  }));

  it('should do something', function() {
    expect(!!editor).to.be.true;
  });
});
