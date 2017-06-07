'use strict';
const angular = require('angular');

export default angular.module('webAppApp.complexVar', [])
  .directive('complexVar', function() {
    return {
      template: require('./complexVar.html'),
      restrict: 'EA',
      scope: {
        members: '=',
        path: '=',
        type: '=',
        inputWidth: '=',
        tabgroup: '=?bind',
        hostVars: '='
      },
      controller: 'ComplexVarController'
    };
  })
  .name;
