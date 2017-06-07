'use strict';
const angular = require('angular');

var ansi_to_html = require('ansi-to-html');

/*@ngInject*/
export function ansi2htmlProvider() {
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
    return new ansi_to_html();
  }];
}

export default angular.module('webAppApp.ansi2html', [])
  .provider('ansi2html', ansi2htmlProvider)
  .name;
