'use strict';
const angular = require('angular');

/*@ngInject*/
export function complexVarModalController($scope,$uibModalInstance,hostvars,members) {

    $scope.members = members || {};
    $scope.hostvars = hostvars;

    $scope.ok = function () {
      $uibModalInstance.close($scope.members);
    };

    $scope.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };
}

export default angular.module('webAppApp.complex_var_modal', [])
  .controller('ComplexVarModalController', complexVarModalController)
  .name;
