'use strict';
const angular = require('angular');

/*@ngInject*/
export function yamlProvider() {
  // Private variables
  var salutation = 'Hello';

  // Private constructor
  function Greeter() {
    this.greet = function() {
      return salutation;
    };
  }

  // Public API for configuration
  this.setSalutation = function(s) {
    salutation = s;
  };

  // Method for instantiating
  this.$get = ['$window', function ($window) {
    // configure JSONEditor using provider's configuration
    return $window.YAML;
  }];
}

export default angular.module('webAppApp.yaml', [])
  .provider('YAML', yamlProvider)
  .name;
