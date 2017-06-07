'use strict';
const angular = require('angular');

/*@ngInject*/
export function newHostController($scope,$uibModalInstance, yamlFile, ansible, selectedProject, editHost, YAML, $timeout) {
  $scope.newHost = editHost || {name:null};

  $scope.variableViewType = {type:'YAML'};

  $scope.complexVar = {};
  $scope.complexVarString = {};

  if($scope.newHost.name){
    $scope.getHostLoading = true;
    ansible.getHostVarsFile($scope.newHost.name,
      function(response){
        $scope.getHostLoading = false;
        $scope.complexVarStringYaml = response.data;
        $scope.complexVar = YAML.parse(response.data);
        $timeout(function(){
          $scope.$broadcast('membersUpdated')
        },100);

      },function(response){
        $scope.getHostLoading = false;
        $scope.err_msg = response.data;
      })
  }

  $scope.$watch('complexVar',function(){
    $scope.complexVarString = JSON.stringify($scope.complexVar, null, '\t');
    $scope.complexVarStringYaml = yamlFile.jsonToYamlFile($scope.complexVar, 'Host Variables - ' + $scope.newHost.name);
  }, true);

  $scope.$watch('newHost',function(){
    $scope.complexVarString = JSON.stringify($scope.complexVar, null, '\t');
    $scope.complexVarStringYaml = yamlFile.jsonToYamlFile($scope.complexVar, 'Host Variables - ' + $scope.newHost.name);
  }, true);

  $scope.aceLoaded = function(_editor){
    _editor.$blockScrolling = Infinity;
  };

  $scope.createHost = function(){
    $scope.createHostLoading = true;
    ansible.updateHostVarsFile($scope.newHost.name,$scope.complexVarStringYaml,
      function(response){
        $scope.createHostLoading = false;
        console.log("Success");
        $scope.ok()
      },function(response){
        $scope.createHostLoading = false;
        $scope.err_msg = response.data;
      });
  };

  $scope.ok = function () {
    if(!$scope.newHost.members)$scope.newHost.members = 'Un grouped';
    $uibModalInstance.close($scope.newHost);
  };

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
}

export default angular.module('webAppApp.new_host', [])
  .controller('NewHostController', newHostController)
  .name;
