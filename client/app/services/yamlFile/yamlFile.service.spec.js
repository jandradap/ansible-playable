'use strict';

describe('Service: yamlFile', function() {
  // load the service's module
  beforeEach(module('webAppApp.yamlFile'));

  // instantiate service
  var yamlFile;
  beforeEach(inject(function(_yamlFile_) {
    yamlFile = _yamlFile_;
  }));

  it('should do something', function() {
    expect(!!yamlFile).to.be.true;
  });
});
