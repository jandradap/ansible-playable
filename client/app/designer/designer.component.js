'use strict';
const angular = require('angular');

const uiRouter = require('angular-ui-router');

import routes from './designer.routes';

export class DesignerComponent {
  /*@ngInject*/
  constructor($scope,Projects,ansible) {
    'ngInject';
    $scope.selectedInventoryFileName = null;

    /**
     * Get list of projects from server
     */
    $scope.getProjects = function(){
      $scope.projects = Projects.resource.query(function(){
        if($scope.projects.length){
          $scope.selectedProjectID = localStorage.selectedProjectID || $scope.projects[0]._id;
          $scope.projectSelected($scope.selectedProjectID)
        }

      })
    };

    /**
     * On ProjectSelected - set selectedProjectID in cache
     * @param projectID
     */
    $scope.projectSelected = function(projectID){
      localStorage.selectedProjectID = projectID;

      $scope.selectedProject = Projects.resource.get({id: projectID},function(){
        Projects.selectedProject = $scope.selectedProject;
        $scope.listOfInventoryFiles();
        $scope.$broadcast('projectLoaded');
      })

    };


    /**
     * Get List of inventory files in project root folder
     */
    $scope.listOfInventoryFiles = function(){

      var rolesTestFolder = null;

      /*if(roleName){
       rolesTestFolder = projectFolder + '/' + roleName + '/tests'
       }*/

      ansible.getInventoryList(function(response){
          $scope.inventoryFiles = response.data;
          console.log($scope.inventoryFiles);
          Projects.selectedInventoryFileName = localStorage.selectedInventoryFileName || $scope.inventoryFiles[0];
          localStorage.selectedInventoryFileName = $scope.inventoryFiles[0];
          $scope.selectedInventoryFileName = localStorage.selectedInventoryFileName
        },
        function(response){
          $scope.err_msg = response.data
        },rolesTestFolder)
    };

    /**
     * Set selected inventory file in local cache.
     * @param selectedInventoryFileName - Selected inventory file name
     */
    $scope.inventoryFileSelected = function(selectedInventoryFileName){
      localStorage.selectedInventoryFileName = selectedInventoryFileName;
    };

    /**
     * Main - Get Projects
     */

    $scope.getProjects();
  }
}

export default angular.module('webAppApp.designer', [uiRouter])
  .config(routes)
  .component('designer', {
    template: require('./designer.html'),
    controller: DesignerComponent,
    controllerAs: 'designerCtrl'
  })
  .name;
