'use strict';
const angular = require('angular');

/*@ngInject*/
export function systemService($http) {
	// AngularJS will instantiate a singleton by calling "new" on this function

  const api_system = '/api/system';
  const api_get_logs = api_system + '/logs';

  this.getLogs = function(type, successCallback, errorCallback){
    $http.get(api_get_logs + '/' + type).then(successCallback, errorCallback);
  }

}

export default angular.module('webAppApp.system', [])
  .service('system', systemService)
  .name;
