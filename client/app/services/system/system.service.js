'use strict';
const angular = require('angular');

/*@ngInject*/
export function systemService($http) {
	// AngularJS will instantiate a singleton by calling "new" on this function

  const api_system = '/api/system';
  const api_get_logs = api_system + '/logs';
  const get_config_disable_ansible_host_addition = api_system + '/config/disable_ansible_host_addition';

  this.getLogs = function(type, successCallback, errorCallback){
    $http.get(api_get_logs + '/' + type).then(successCallback, errorCallback);
  };

  this.getConfigDisableAnsibleHostAddition = function(successCallback, errorCallback){
    $http.get(get_config_disable_ansible_host_addition).then(successCallback, errorCallback);
  }

}

export default angular.module('webAppApp.system', [])
  .service('system', systemService)
  .name;
