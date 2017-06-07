'use strict';

describe('Directive: complexVar', function() {
  // load the directive's module and view
  beforeEach(module('webAppApp.complexVar'));
  beforeEach(module('app/directives/complexVar/complexVar.html'));

  var element, scope;

  beforeEach(inject(function($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function($compile) {
    element = angular.element('<complex-var></complex-var>');
    element = $compile(element)(scope);
    scope.$apply();
    expect(element.text()).to.equal('this is the complexVar directive');
  }));
});
