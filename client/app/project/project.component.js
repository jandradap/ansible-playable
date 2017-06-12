'use strict';
const angular = require('angular');

const uiRouter = require('angular-ui-router');

import routes from './project.routes';

export class ProjectComponent {
  /*@ngInject*/
  constructor($scope, Projects, Auth) {
    'ngInject';
    var default_project_folder = '/opt/ehc-ansible-projects/';

    $scope.blankProject = {
      name: '',
      ansibleEngine: {
        ansibleHost: '',
        ansibleHostUser: '',
        ansibleHostPassword: '',
        projectFolder: '',
        customModules: ''

      }
    };

    $scope.msg = "";
    $scope.msg_status = "";

    $scope.newProject = $scope.blankProject;

    $scope.editProjectFlag = false;

    $scope.saveButtonIcon = "fa-save";

    $scope.showProjectForm = function(){
      $scope.showCreateProject = true;
      $scope.editProjectFlag = false;
      $scope.newProject = $scope.blankProject;
      $scope.msg = "";
      $scope.msg_status = "";
    };


    $scope.hideProjectForm = function(){
      $scope.showCreateProject = false;
      $scope.editProjectFlag = false;
      $scope.newProject = $scope.blankProject;
      $scope.msg = "";
      $scope.msg_status = "";
    };

    $scope.getProjects = function(){
      console.log("Getting Projects");
      $scope.projects = Projects.resource.query(function(){
        console.log($scope.projects);
      })

    };

    $scope.getProjects();

    $scope.deleteProject = function(project){
      project.$remove(function(){
        $scope.getProjects();
      })
    };

    $scope.editProject = function(project){
      $scope.showCreateProject = true;
      $scope.editProjectFlag = true;
      $scope.newProject = project;
    };

    $scope.createProject = function(){
      $scope.newProject.creationTime = new Date();
      //$scope.newProject.ansibleEngine.projectFolder = default_project_folder + '/' + $scope.newProject.name
      //$scope.newProject.ansibleEngine.customModules = $scope.newProject.ansibleEngine.projectFolder + '/library'

      var projectSavedCallback = function(){
        $scope.showCreateProject = false;
        $scope.msg = "Project Saved Successfully";
        $scope.msg_status = "success";
        $scope.getProjects();
        $scope.saveButtonIcon = 'fa-save';
      };

      var projectSaveFailedCallback = function(errResponse){
        $scope.msg = errResponse.data;
        $scope.msg_status = "danger";
        $scope.saveButtonIcon = 'fa-save';
      };

      $scope.saveButtonIcon = 'fa-spinner fa-spin';

      if($scope.editProjectFlag){
        $scope.editProjectFlag = false;
        $scope.newProject.$update(projectSavedCallback,projectSaveFailedCallback);
      }else{
        Projects.resource.save($scope.newProject,projectSavedCallback,projectSaveFailedCallback);
      }


    };

    $scope.$watch('newProject.name', function(newValue, oldValue){
      console.log("Changed");
      // Project folders cannot be edited once created
      var user_id = Auth.getCurrentUserSync()._id;
      if($scope.editProjectFlag)return;
      $scope.newProject.ansibleEngine.projectFolder = '/opt/ansible-projects/' + user_id + '_' + newValue;
      $scope.newProject.ansibleEngine.customModules = '/opt/ansible-projects/' + user_id + '_' + newValue + '/library';
    });

  }
}

export default angular.module('webAppApp.project', [uiRouter])
  .config(routes)
  .component('project', {
    template: require('./project.html'),
    controller: ProjectComponent,
    controllerAs: 'projectCtrl'
  })
  .name;
