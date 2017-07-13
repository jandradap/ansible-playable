'use strict';
const angular = require('angular');

const uiRouter = require('angular-ui-router');

import routes from './project.routes';

export class ProjectComponent {
  /*@ngInject*/
  constructor($scope, Projects, Auth, appConfig, system) {
    'ngInject';
    var projectCtrl = this;

    system.getConfigDisableAnsibleHostAddition((response) => {
      projectCtrl.disableAnsibleHostAddition = response.data;
      console.log(projectCtrl.disableAnsibleHostAddition)
    });

    // Define a blank project object
    projectCtrl.blankProject = {
      name: '',
      ansibleEngine: {
        ansibleHost: '',
        ansibleHostUser: '',
        ansibleHostPassword: '',
        projectFolder: '',
        customModules: ''

      }
    };

    projectCtrl.msg = "";
    projectCtrl.msg_status = "";

    projectCtrl.newProject = projectCtrl.blankProject;

    projectCtrl.editProjectFlag = false;

    projectCtrl.saveButtonIcon = "fa-save";

    /**
     * Show Project Form when the create button is clicked
     */
    projectCtrl.showProjectForm = function(){
      projectCtrl.showCreateProject = true;
      projectCtrl.editProjectFlag = false;
      projectCtrl.newProject = projectCtrl.blankProject;
      projectCtrl.msg = "";
      projectCtrl.msg_status = "";
    };

    /**
     * Hide Project form when cancel button is clicked
     */
    projectCtrl.hideProjectForm = function(){
      projectCtrl.showCreateProject = false;
      projectCtrl.editProjectFlag = false;
      projectCtrl.newProject = projectCtrl.blankProject;
      projectCtrl.msg = "";
      projectCtrl.msg_status = "";
    };

    /**
     * Get list of all projects
     */
    projectCtrl.getProjects = function(){
      projectCtrl.projects = Projects.resource.query(function(){
        console.log(projectCtrl.projects);
      })

    };

    /**
     * Delete Project
     * @param project
     */
    projectCtrl.deleteProject = function(project){
      project.$remove(function(){
        projectCtrl.getProjects();
      })
    };

    /**
     * Edit Project
     * @param project
     */
    projectCtrl.editProject = function(project){
      projectCtrl.showCreateProject = true;
      projectCtrl.editProjectFlag = true;
      projectCtrl.newProject = project;
    };

    /**
     * Create a new Project
     */
    projectCtrl.createProject = function(){
      projectCtrl.newProject.creationTime = new Date();

      var projectSavedCallback = function(){
        projectCtrl.showCreateProject = false;
        projectCtrl.msg = "Project Saved Successfully";
        projectCtrl.msg_status = "success";
        projectCtrl.getProjects();
        projectCtrl.saveButtonIcon = 'fa-save';
      };

      var projectSaveFailedCallback = function(errResponse){
        projectCtrl.msg = errResponse.data;
        projectCtrl.msg_status = "danger";
        projectCtrl.saveButtonIcon = 'fa-save';
      };

      projectCtrl.saveButtonIcon = 'fa-spinner fa-spin';

      if(projectCtrl.editProjectFlag){
        projectCtrl.editProjectFlag = false;
        projectCtrl.newProject.$update(projectSavedCallback,projectSaveFailedCallback);
      }else{
        Projects.resource.save(projectCtrl.newProject,projectSavedCallback,projectSaveFailedCallback);
      }

    };

    // Watch for project name change in create mode and update project and custom modules folder dynamically
    $scope.$watch('projectCtrl.newProject.name', function(newValue, oldValue){
      // Project folders cannot be edited once created
      var user_id = Auth.getCurrentUserSync()._id;
      if(projectCtrl.editProjectFlag)return;
      projectCtrl.newProject.ansibleEngine.projectFolder = appConfig.paths.ansible_projects + '/' + user_id + '_' + newValue;
      projectCtrl.newProject.ansibleEngine.customModules = appConfig.paths.ansible_projects + '/' + user_id + '_' + newValue + '/library';
    });

    projectCtrl.getProjects();

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
