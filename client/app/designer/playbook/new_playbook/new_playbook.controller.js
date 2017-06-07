'use strict';
const angular = require('angular');

/*@ngInject*/
export function newPlaybookController($scope,$uibModalInstance,ansible) {
  $scope.newPlaybook = {name:null};

  $scope.createPlaybookLoading = false;

  $scope.createPlaybook = function(){
    $scope.createPlaybookLoading = true;

    ansible.createPlaybook($scope.newPlaybook.name + '.yml',"",
      function(response){
        $scope.createPlaybookLoading = false;
        $scope.ok();
      },
      function(response){
        $scope.createPlaybookLoading = false;
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

export default angular.module('webAppApp.new_playbook', [])
  .controller('NewPlaybookController', newPlaybookController)
  .name;
