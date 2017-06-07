'use strict';
const angular = require('angular');

/*@ngInject*/
export function addDotInKeyFilter() {
  return function(input) {
    return JSON.parse(JSON.stringify(input).replace(/__dot__/g,'.'));
  };
}


export default angular.module('webAppApp.addDotInKey', [])
  .filter('addDotInKey', addDotInKeyFilter)
  .name;
