'use strict';
const angular = require('angular');

/*@ngInject*/
export function dictToKeyValueArraySimpleFilter() {
  var convert = function (input,prefix) {
    var result = [];
    angular.forEach(input,function(value,key){
      result.push({"key":key ,"value":value})
    });
    return result;
  };

  return convert;
}


export default angular.module('webAppApp.dictToKeyValueArraySimple', [])
  .filter('dictToKeyValueArraySimple', dictToKeyValueArraySimpleFilter)
  .name;
