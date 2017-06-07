'use strict';
const angular = require('angular');

/*@ngInject*/
export function dictToKeyValueArrayFilter() {
  var convert = function (input,prefix) {
    var result = [];
    angular.forEach(input,function(value,key){
      key = key.replace(/\./g,"__dot__");
      if(prefix){
        key = prefix + '.' + key;
      }
      if(typeof value != 'object'){
        result.push({"key":key ,"value":value})
      }else{
        result = result.concat(convert(value,key))
      }

    });
    return result;
  };

  return convert;
}


export default angular.module('webAppApp.dictToKeyValueArray', [])
  .filter('dictToKeyValueArray', dictToKeyValueArrayFilter)
  .name;
