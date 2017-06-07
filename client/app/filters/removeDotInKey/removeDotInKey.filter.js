'use strict';
const angular = require('angular');

/*@ngInject*/
export function removeDotInKeyFilter() {
  return function(input) {
    var result = {};
    angular.forEach(input,function(value,key){
      result[key.replace(/\./g,'__dot__')] = value
    });
    return result;
  };
}


export default angular.module('webAppApp.removeDotInKey', [])
  .filter('removeDotInKey', removeDotInKeyFilter)
  .name;
