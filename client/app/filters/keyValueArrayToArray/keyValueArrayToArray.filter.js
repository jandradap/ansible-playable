'use strict';
const angular = require('angular');

/*@ngInject*/
export function keyValueArrayToArrayFilter() {
  return function(input) {
    var resultItem = [];
    angular.forEach(input,function(item){
      resultItem.push(item.value || "");
    });
    return resultItem;
  };
}


export default angular.module('webAppApp.keyValueArrayToArray', [])
  .filter('keyValueArrayToArray', keyValueArrayToArrayFilter)
  .name;
