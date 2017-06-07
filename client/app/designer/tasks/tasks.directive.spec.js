'use strict';

describe('Directive: tasks', function() {
  // load the directive's module and view
  beforeEach(module('webAppApp.tasks'));
  beforeEach(module('app/designer/tasks/tasks.html'));

  var element, scope;

  beforeEach(inject(function($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function($compile) {
    element = angular.element('<tasks></tasks>');
    element = $compile(element)(scope);
    scope.$apply();
    expect(element.text()).to.equal('this is the tasks directive');
  }));
});
