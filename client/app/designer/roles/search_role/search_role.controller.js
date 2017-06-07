'use strict';
const angular = require('angular');

/*@ngInject*/
export function searchRoleController($scope,ansible,selectedProject,$uibModalInstance) {

  $scope.searchText = '';
  $scope.searchLoading = false;

  $scope.selectedRole = {role:{}};



  $scope.searchRoles = function(){
    $scope.searchResult = [];
    $scope.searchLoading = true;
    ansible.searchRolesGalaxy($scope.searchText,
      function(response){
        $scope.searchLoading = false;
        $scope.searchResult = $scope.searchResult.concat(response.data)
      },function(response){
        $scope.searchLoading = false;
        $scope.err_msg = response.data
      });

    ansible.searchRolesGithub($scope.searchText,
      function(response){
        $scope.searchLoading = false;
        $scope.searchResult = $scope.searchResult.concat(response.data)
      },function(response){
        $scope.searchLoading = false;
        $scope.err_msg = response.data
      })


  };


  $scope.importRole = function(role){
    $scope.importLoading = true;

    if(role.type === 'galaxy')role.url = role.name;

    ansible.importRole(role.type,role.url,
      function(response){
        $scope.importLoading = false;
        $scope.ok();
      },function(response){
        $scope.importLoading = false;
        $scope.err_msg = response.data
      });
  };


  $scope.ok = function () {
    $uibModalInstance.close(null);
  };

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
}

export default angular.module('webAppApp.search_role', [])
  .controller('SearchRoleController', searchRoleController)
  .name;
