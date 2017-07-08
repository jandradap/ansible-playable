'use strict';
const angular = require('angular');

const uiRouter = require('angular-ui-router');

import routes from './custom_modules.routes';

export class CustomModulesComponent {
  /*@ngInject*/
  constructor($scope,customModules,$sce,ansi2html,Projects,$uibModal,YAML) {
    'ngInject';

    var customModulesCtrl = this;

    customModulesCtrl.custom_modules = [];
    customModulesCtrl.selectedModule = {module:{},module_code:"",module_unchanged_code:""};
    customModulesCtrl.selected_module_code = "something";

    customModulesCtrl.showNewModuleForm = {value:false};

    /**
     * Get List of Projects
     */
    customModulesCtrl.getProjects = function(){
      customModulesCtrl.projects = Projects.resource.query(function(){
        if(customModulesCtrl.projects.length){
          customModulesCtrl.selectedProjectID = localStorage.selectedProjectID || customModulesCtrl.projects[0]._id;
          customModulesCtrl.projectSelected(customModulesCtrl.selectedProjectID)
        }

      })
    };

    /**
     * On project selection
     *  - List all custom modules in that project
     * @param projectID
     */
    customModulesCtrl.projectSelected = function(projectID){

      localStorage.selectedProjectID = projectID;

      customModulesCtrl.selectedProject = Projects.resource.get({id: projectID},function(){
        Projects.selectedProject = customModulesCtrl.selectedProject;
        customModulesCtrl.getCustomModules();
      })
    };


    /**
     * Get a list of Custom modules in the selected project
     */
    customModulesCtrl.getCustomModules = function(){
      customModules.get(function(response){
        var lines = response.data.split("\n");
        if(lines.length)
          lines = lines
            .filter(function(line){return line.indexOf(".py") > -1})
            .map(function(item){return {name:item}});
        customModulesCtrl.custom_modules = lines;

        if(customModulesCtrl.selectedModule.module.name){
          customModulesCtrl.selectedModule.module = customModulesCtrl.custom_modules.filter(function(item){
            return (item.name == customModulesCtrl.selectedModule.module.name)
          })[0]
        }


      });
    };



    /**
     * Show Module Code. Read the module file contents and display in UI
     * @param module_name
     */
    customModulesCtrl.loadingModuleCode = false;

    customModulesCtrl.showModuleCode = function(module_name){
      customModulesCtrl.loadingModuleCode = true;
      if(!module_name){
        customModulesCtrl.selectedModule.module_code = "Select a module";
        return;
      }
      customModules.show(module_name,function(response) {
        customModulesCtrl.loadingModuleCode = false;
        customModulesCtrl.selectedModule.module_code = response.data.split("Stream :: close")[0];
        customModulesCtrl.selectedModule.module_unchanged_code = angular.copy(customModulesCtrl.selectedModule.module_code);
      });
    };


    /**
     * On selected module change display code in UI
     */
    $scope.$watch('customModulesCtrl.selectedModule.module',function(newValue,oldValue){
      if(newValue.name && newValue.name !== oldValue.name){
        customModulesCtrl.selectedModule.module_code = "Loading Module Code...";
        customModulesCtrl.showModuleCode(newValue.name)
      }
    });


    /**
     * On Code Change
     *
     */
    customModulesCtrl.code_has_changed = false;

    customModulesCtrl.codeChanged = function(){
      if(customModulesCtrl.selectedModule.module_unchanged_code !== customModulesCtrl.selectedModule.module_code){
        customModulesCtrl.code_has_changed = true
      }else{
        customModulesCtrl.code_has_changed = false
      }
    };

    /**
     * Discard code changes
     */
    customModulesCtrl.discardCodeChanges = function(){
      customModulesCtrl.selectedModule.module_code = angular.copy(customModulesCtrl.selectedModule.module_unchanged_code);
    };

    /**
     * Save Module
     */
    customModulesCtrl.saveModule = function(){
      customModulesCtrl.saving = true;
      customModules.save(customModulesCtrl.selectedModule.module.name,customModulesCtrl.selectedModule.module_code,function(response){
        customModulesCtrl.saving = false;
        customModulesCtrl.code_has_changed = false;
        customModulesCtrl.selectedModule.module_unchanged_code = angular.copy(customModulesCtrl.selectedModule.module_code);

      },function(response){
        customModulesCtrl.saving = false;
        console.error(response.data)
      })
    };


    /**
     * Test Module
     */
    customModulesCtrl.testModule = function(){

      var re = /([^]+DOCUMENTATION = '''\s+)([^]+?)(\s+'''[^]+)/;
      var module_string = customModulesCtrl.selectedModule.module_code.replace(re,'$2');

      customModulesCtrl.selectedModuleObject = YAML.parse(module_string);

      //var options_copy = angular.copy(customModulesCtrl.selectedModuleObject.options);
      var options_copy = {};
      /*options_copy = options_copy.map(function(item){
       var temp_obj = {};
       temp_obj[item.name] = "";
       return temp_obj
       });*/

      var module_name = customModulesCtrl.selectedModule.module.name;
      var module_cached_args = null;

      try{
        module_cached_args = JSON.parse(localStorage['test_args_'+module_name]);
      }catch (e){
        console.log("Error getting cached arguments.");
        module_cached_args = null;
      }

      angular.forEach(customModulesCtrl.selectedModuleObject.options,function(value,key){
        //var temp_obj = {};
        //temp_obj[key] = "";
        options_copy[key] = "";

        if(module_cached_args && key in module_cached_args){
          options_copy[key] = module_cached_args[key];
        }

      });


      var variable = {name:'',complexValue:options_copy};
      customModulesCtrl.showComplexVariable(variable);

    };

    /**
     * New Module - On pressing New Module button
     */
    customModulesCtrl.newModule = function(){
      customModulesCtrl.showNewModuleForm.value = true;
      $scope.$broadcast ('newModule');
    };

    /**
     * Edit Module - On pressing Edit Module button
     */
    customModulesCtrl.editModule = function(){
      customModulesCtrl.showNewModuleForm.value = true;
      $scope.$broadcast ('editModule');
    };


    /**
     * Show Complex Variable modal for getting input parameters for testing module
     * @param variable
     */
    customModulesCtrl.showComplexVariable = function(variable){
      customModulesCtrl.result = "";
      var modalInstance = $uibModal.open({
        animation: true,
        template: require('../../app/modals/complex_var_modal/complexVariable.html'),
        controller: 'ComplexVarModalController',
        size: 'sm',
        backdrop: 'static',
        keyboard: false,
        closeByEscape: false,
        closeByDocument: false,
        resolve: {
          path: function () {
            return variable.name
          },
          hostvars: function(){
            return null
          },
          members: function(){
            return variable.complexValue
          }
        }
      });

      modalInstance.result.then(function (module_args) {

        var module_name = customModulesCtrl.selectedModule.module.name;

        /*var args = "";
         angular.forEach(selectedItem,function(value,key){

         if(value){
         args += " " + key + "=" + value
         }

         });

         if(args){
         module_name += " -a " + args
         }*/

        localStorage['test_args_'+module_name] = JSON.stringify(module_args);

        customModulesCtrl.testing = true;

        customModules.test(module_name,module_args,function(response) {
            customModulesCtrl.testing = false;
            customModulesCtrl.result = $sce.trustAsHtml(ansi2html.toHtml(response.data.split("Stream :: close")[0]).replace(/\n/g, "<br>"));
          },
          function(response) {
            customModulesCtrl.testing = false;
            customModulesCtrl.result = $sce.trustAsHtml(ansi2html.toHtml(response.data.split("Stream :: close")[0]).replace(/\n/g, "<br>"));
          });

      }, function () {

      });

    };

    // List projects
    customModulesCtrl.getProjects();

  }
}

export default angular.module('webAppApp.custom_modules', [uiRouter])
  .config(routes)
  .component('customModules', {
    template: require('./custom_modules.html'),
    controller: CustomModulesComponent,
    controllerAs: 'customModulesCtrl'
  })
  .name;
