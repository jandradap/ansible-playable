'use strict';
const angular = require('angular');

/*@ngInject*/
export function newFileController($scope,$uibModalInstance,ansible,selectedDirectory,copyFile,selectedFileName) {
  $scope.newFile = {name:null};
  $scope.createFileLoading = false;
  $scope.title = 'New File';

  var parentDirectory = selectedDirectory;

  // If copyFile use selectedFileName to create new role from
  // else nullify selectedFileName
  if(!copyFile){
    selectedFileName = null;
  }
  else {
    $scope.title = 'Copy File';
    $scope.newFile.name = 'Copy of ' + selectedFileName;
  }

  /**
   * Create/Copy File - Either a new role or copy an existing role
   */
  $scope.createFile = function(){

    $scope.createFileLoading = true;
    ansible.createFile(parentDirectory + '/' + $scope.newFile.name,
      function(response){
        $scope.createFileLoading = false;
        $scope.ok();
      },
      function(response){
        $scope.createFileLoading = false;
        $scope.err_msg = response.data;
      },
      selectedFileName
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

export default angular.module('webAppApp.new_file', [])
  .controller('NewFileController', newFileController)
  .name;
