'use strict';
const angular = require('angular');

/*@ngInject*/
export function newInventoryController($scope,$uibModalInstance,ansible,selectedProject) {
  $scope.newInventory = {name:'inventory'};

  $scope.createInventoryLoading = false;

  $scope.createInventory = function(){

    if($scope.newInventory.name.match(/\./)){
      $scope.err_msg = "Inventory files should not have extension"
      return
    }

    $scope.createInventoryLoading = true;
    ansible.createInventory($scope.newInventory.name,'# Inventory File - ' + $scope.newInventory.name,
      function(response){
        $scope.createInventoryLoading = false;
        $scope.ok();
      },
      function(response){
        $scope.createInventoryLoading = false;
        $scope.err_msg = response.data;
      })
  };

  $scope.ok = function () {
    $uibModalInstance.close(null);
  };

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
}

export default angular.module('webAppApp.new_inventory', [])
  .controller('NewInventoryController', newInventoryController)
  .name;
