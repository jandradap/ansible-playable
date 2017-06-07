'use strict';

describe('Controller: ComplexVarModalCtrl', function() {
  // load the controller's module
  beforeEach(module('webAppApp.complex_var_modal'));

  var ComplexVarModalCtrl;

  // Initialize the controller and a mock scope
  beforeEach(inject(function($controller) {
    ComplexVarModalCtrl = $controller('ComplexVarModalCtrl', {});
  }));

  it('should ...', function() {
    expect(1).to.equal(1);
  });
});
