'use strict';
const angular = require('angular');

/*@ngInject*/
export function keyValueArrayToDictFilter() {
  return function(input) {
    var resultItem = {};
    angular.forEach(input,function(item){
      resultItem[item.key] = item.value || "";
    });
    return resultItem;
  };
}


export default angular.module('webAppApp.keyValueArrayToDict', [])
  .filter('keyValueArrayToDict', keyValueArrayToDictFilter)
  .name;
