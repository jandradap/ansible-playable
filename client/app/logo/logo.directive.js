'use strict';
const angular = require('angular');

export default angular.module('webAppApp.logo', [])
  .directive('logo', function() {
    return {
      template: require('./logo.html'),
      restrict: 'EA',
      link: function(scope, element, attrs) {}
    };
  })
  .name;
