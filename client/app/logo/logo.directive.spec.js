'use strict';

describe('Directive: logo', function() {
  // load the directive's module and view
  beforeEach(module('webAppApp.logo'));
  beforeEach(module('app/logo/logo.html'));

  var element, scope;

  beforeEach(inject(function($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function($compile) {
    element = angular.element('<logo></logo>');
    element = $compile(element)(scope);
    scope.$apply();
    expect(element.text()).to.equal('this is the logo directive');
  }));
});
