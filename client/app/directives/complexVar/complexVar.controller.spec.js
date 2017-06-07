'use strict';

describe('Controller: ComplexVarCtrl', function() {
  // load the controller's module
  beforeEach(module('webAppApp.complexVar'));

  var ComplexVarCtrl;

  // Initialize the controller and a mock scope
  beforeEach(inject(function($controller) {
    ComplexVarCtrl = $controller('ComplexVarCtrl', {});
  }));

  it('should ...', function() {
    expect(1).to.equal(1);
  });
});
