'use strict';
const angular = require('angular');

/*@ngInject*/
export function yamlService() {
	// AngularJS will instantiate a singleton by calling "new" on this function

  this.$get = ['$window', function ($window) {
    // configure JSONEditor using provider's configuration
    console.log("Window");

    return $window.YAML;
  }];

}

export default angular.module('webAppApp.yaml', [])
  .factory('YAML', yamlService)
  .name;
