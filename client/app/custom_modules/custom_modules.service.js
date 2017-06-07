'use strict';
const angular = require('angular');

/*@ngInject*/
export function customModulesService($http,Projects) {
	// AngularJS will instantiate a singleton by calling "new" on this function

  var uri = '/api/custom_modules';

  this.get = function(successCallback,errorCallback){
    $http.post(uri + '/query',{ansibleEngine:Projects.selectedProject.ansibleEngine}).then(successCallback,errorCallback)
  };

  this.show = function(customModule,successCallback,errorCallback){
    $http.post(uri+ '/' + customModule+'/get',{ansibleEngine:Projects.selectedProject.ansibleEngine}).then(successCallback,errorCallback)
  };

  this.test = function(customModule,module_args,successCallback,errorCallback){
    $http.post(uri + '/' + customModule + '/test',{ansibleEngine:Projects.selectedProject.ansibleEngine,moduleArgs:module_args}).then(successCallback,errorCallback)
  };

  this.save = function(customModule,customModuleCode,successCallback,errorCallback){
    $http.post(uri + '/' + customModule,{ansibleEngine:Projects.selectedProject.ansibleEngine,custom_module_code:customModuleCode}).then(successCallback,errorCallback)
  }

}

export default angular.module('webAppApp.custom_modules_service', [])
  .service('customModules', customModulesService)
  .name;
