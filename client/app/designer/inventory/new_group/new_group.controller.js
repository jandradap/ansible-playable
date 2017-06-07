'use strict';
const angular = require('angular');

/*@ngInject*/
export function newGroupController($scope,$uibModalInstance, yamlFile, ansible, selectedProject, editGroup, YAML, $timeout) {
  'ngInject';
  $scope.newGroup = editGroup || {name:null};
  $scope.variableViewType = {type:'YAML'};

  $scope.complexVar = {};
  $scope.complexVarString = {};

  console.log("$scope.newGroup.name" + $scope.newGroup.name);

  $scope.aceLoaded = function (_editor) {
    _editor.$blockScrolling = Infinity;
  };

  if($scope.newGroup.members){
    $scope.newGroup.members = $scope.newGroup.members.join(',');
  }

  if($scope.newGroup.name){
    $scope.getGroupLoading = true;
    ansible.getGroupVarsFile($scope.newGroup.name,
      function(response){
        $scope.getGroupLoading = false;
        $scope.complexVarStringYaml = response.data;
        $scope.complexVar = YAML.parse(response.data);

        $timeout(function(){
          $scope.$broadcast('membersUpdated')
        },100);

      },function(response){
        $scope.getGroupLoading = false;
        $scope.err_msg = response.data;
      })
  }

  $scope.$watch('complexVar',function(){
    $scope.complexVarString = JSON.stringify($scope.complexVar, null, '\t');
    $scope.complexVarStringYaml = yamlFile.jsonToYamlFile($scope.complexVar, 'Group Variables - ' + $scope.newGroup.name);
  }, true);

  $scope.$watch('newGroup',function(){
    $scope.complexVarString = JSON.stringify($scope.complexVar, null, '\t');
    $scope.complexVarStringYaml = yamlFile.jsonToYamlFile($scope.complexVar, 'Group Variables - ' + $scope.newGroup.name);
  }, true);

  $scope.createGroup = function(){
    $scope.createGroupLoading = true;
    ansible.updateGroupVarsFile($scope.newGroup.name,$scope.complexVarStringYaml,
      function(response){
        $scope.createGroupLoading = false;
        console.log("Success");
        $scope.ok()
      },function(response){
        $scope.createGroupLoading = false;
        $scope.err_msg = response.data;
      });
  };

  $scope.ok = function () {
    var resultGroup = {name:$scope.newGroup.name};

    if($scope.newGroup.members){
      resultGroup.members = $scope.newGroup.members.split(',');
      $scope.newGroup.members = $scope.newGroup.members.split(',')
    }

    $uibModalInstance.close(resultGroup);
  };

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
}

export default angular.module('webAppApp.new_group', [])
  .controller('NewGroupController', newGroupController)
  .name;
