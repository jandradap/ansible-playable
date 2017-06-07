'use strict';
const angular = require('angular');

/*@ngInject*/
export function newRoleController($scope,$uibModalInstance,ansible,selectedRoleName,copyRole) {

  $scope.newRole = {name:null};
  $scope.createRoleLoading = false;
  $scope.title = 'New Role';

  // If copyRole use selectedRoleName to create new role from
  // else nullify selectedRoleName
  if(!copyRole){
    selectedRoleName = null;
  }
  else {
    $scope.title = 'Copy Role';
    $scope.newRole.name = 'Copy of ' + selectedRoleName;
  }

  /**
   * Create/Copy Role - Either a new role or copy an existing role
   */
  $scope.createRole = function(){
    $scope.createRoleLoading = true;
    ansible.createRole($scope.newRole.name,
      function(response){
        $scope.createRoleLoading = false;
        $scope.ok();
      },
      function(response){
        $scope.createRoleLoading = false;
        $scope.err_msg = response.data;
      },
      selectedRoleName
    )
  };

  /**
   * Close create/copy modal
   */
  $scope.ok = function () {
    $uibModalInstance.close(null);
  };

  /**
   * Cancel modal
   */
  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
}

export default angular.module('webAppApp.new_role', [])
  .controller('NewRoleController', newRoleController)
  .name;
