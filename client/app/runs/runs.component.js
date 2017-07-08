'use strict';
const angular = require('angular');

const uiRouter = require('angular-ui-router');

import routes from './runs.routes';

export class RunsComponent {
  /*@ngInject*/
  constructor(ansible,$scope,$sce,$uibModal,ansi2html,Projects) {
    'ngInject';
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

    $scope.getProjects();

    /**
     * On ProjectSelected - set selectedProjectID in cache
     * @param projectID
     */
    $scope.projectSelected = function(projectID){
      localStorage.selectedProjectID = projectID;

      $scope.selectedProject = Projects.resource.get({id: projectID},function(){
        Projects.selectedProject = $scope.selectedProject;
        $scope.$broadcast('projectLoaded');
      })

    };

    $scope.showLogs = function(runData){
      var modalInstance = $uibModal.open({
        animation: false,
        template: require('../designer/execution/executeModal.html'),
        controller: 'ExecutionController',
        size: 'lg',
        backdrop  : 'static',
        keyboard  : false,
        closeByEscape : false,
        closeByDocument : false,
        resolve: {
          inventory_file_contents: function () {
            return null;
          },
          yaml: function () {
            return null;
          },
          tags: function(){
            return null
          },
          selectedProject: function(){
            return null
          },
          selectedPlaybook: function(){
            return null
          },
          selectedPlay: function(){
            return null
          },
          executionType: function(){
            return null
          },
          executionName: function(){
            return null
          },
          readOnly: function(){
            return true
          },
          runData: function(){
            return runData
          },
          projectFolder: function () {
            return null
          },
          roleName: function () {
            return null
          }
        }
      });
    }

    $scope.executeAnsiblePlayBook = function(tags,executionType,executionName,selectedPlay){

    };

    $scope.getLogs = function(){
      ansible.getLogs($scope.executionData,function(successResponse) {
        $scope.result = $sce.trustAsHtml(ansi2html.toHtml(successResponse.data).replace(/\n/g, "<br>"));

        if(successResponse.data.indexOf('SCRIPT_FINISHED') > -1){
          $scope.refreshLog = false;
        }

      });
    };

    ansible.query(
      function(response){
        $scope.runs = response.data
      },
      function(response){

      })
  }
}

export default angular.module('webAppApp.runs', [uiRouter])
  .config(routes)
  .component('runs', {
    template: require('./runs.html'),
    controller: RunsComponent,
    controllerAs: 'runsCtrl'
  })
  .name;
