'use strict';
const angular = require('angular');

const uiRouter = require('angular-ui-router');

import routes from './custom_modules.routes';

export class CustomModulesComponent {
  /*@ngInject*/
  constructor($scope,customModules,$sce,ansi2html,Projects,$uibModal,YAML) {
    'ngInject';

    $scope.custom_modules = [];
    $scope.selectedModule = {module:{},module_code:"",module_unchanged_code:""};
    $scope.selected_module_code = "something";

    $scope.showNewModuleForm = {value:false};

    $scope.getProjects = function(){
      $scope.projects = Projects.resource.query(function(){
        if($scope.projects.length){
          $scope.selectedProjectID = localStorage.selectedProjectID || $scope.projects[0]._id;
          $scope.projectSelected($scope.selectedProjectID)
        }

      })
    };

    $scope.projectSelected = function(projectID){

      localStorage.selectedProjectID = projectID;

      $scope.selectedProject = Projects.resource.get({id: projectID},function(){
        Projects.selectedProject = $scope.selectedProject;
        $scope.getCustomModules();
      })
    };

    $scope.getProjects();

    $scope.getCustomModules = function(){
      customModules.get(function(response){
        console.log(response.data);
        var lines = response.data.split("\n");
        if(lines.length)
          lines = lines
            .filter(function(line){return line.indexOf(".py") > -1})
            .map(function(item){return {name:item}});
        $scope.custom_modules = lines;

        if($scope.selectedModule.module.name){
          $scope.selectedModule.module = $scope.custom_modules.filter(function(item){
            return (item.name == $scope.selectedModule.module.name)
          })[0]
        }


      });
    };

    $scope.loadingModuleCode = false

    $scope.showModuleCode = function(module_name){
      $scope.loadingModuleCode = true;
      if(!module_name){
        $scope.selectedModule.module_code = "Select a module";
        return;
      }
      customModules.show(module_name,function(response) {
        $scope.loadingModuleCode = false;
        $scope.selectedModule.module_code = response.data.split("Stream :: close")[0];
        $scope.selectedModule.module_unchanged_code = angular.copy($scope.selectedModule.module_code);
      });
    };

    $scope.$watch('selectedModule.module',function(newValue,oldValue){
      if(newValue.name && newValue.name !== oldValue.name){
        $scope.selectedModule.module_code = "Loading Module Code...";
        $scope.showModuleCode(newValue.name)
      }
    });

    $scope.code_has_changed = false;

    $scope.codeChanged = function(){
      console.log("Code Changed");
      if($scope.selectedModule.module_unchanged_code !== $scope.selectedModule.module_code){
        $scope.code_has_changed = true
      }else{
        $scope.code_has_changed = false
      }
    };

    $scope.discardCodeChanges = function(){
      $scope.selectedModule.module_code = angular.copy($scope.selectedModule.module_unchanged_code);
    };

    $scope.saveModule = function(){
      $scope.saving = true;
      customModules.save($scope.selectedModule.module.name,$scope.selectedModule.module_code,function(response){
        $scope.saving = false;
        $scope.code_has_changed = false;
        $scope.selectedModule.module_unchanged_code = angular.copy($scope.selectedModule.module_code);
        console.log("Success")
      },function(response){
        $scope.saving = false;
        console.error(response.data)
      })
    };

    $scope.testModule = function(){

      var re = /([^]+DOCUMENTATION = '''\s+)([^]+?)(\s+'''[^]+)/;
      var module_string = $scope.selectedModule.module_code.replace(re,'$2');

      $scope.selectedModuleObject = YAML.parse(module_string);

      //var options_copy = angular.copy($scope.selectedModuleObject.options);
      var options_copy = {};
      /*options_copy = options_copy.map(function(item){
       var temp_obj = {};
       temp_obj[item.name] = "";
       return temp_obj
       });*/

      var module_name = $scope.selectedModule.module.name;
      var module_cached_args = null;

      try{
        module_cached_args = JSON.parse(localStorage['test_args_'+module_name]);
      }catch (e){
        console.log("Error getting cached arguments.");
        module_cached_args = null;
      }

      angular.forEach($scope.selectedModuleObject.options,function(value,key){
        //var temp_obj = {};
        //temp_obj[key] = "";
        options_copy[key] = "";

        if(module_cached_args && key in module_cached_args){
          options_copy[key] = module_cached_args[key];
        }

      });


      var variable = {name:'',complexValue:options_copy};
      $scope.showComplexVariable(variable);

    };

    $scope.newModule = function(){
      $scope.showNewModuleForm.value = true;
      $scope.$broadcast ('newModule');
    };

    $scope.editModule = function(){
      $scope.showNewModuleForm.value = true;
      $scope.$broadcast ('editModule');
    };



    $scope.showComplexVariable = function(variable){
      $scope.result = "";
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

        var module_name = $scope.selectedModule.module.name;

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

        $scope.testing = true;

        customModules.test(module_name,module_args,function(response) {
            $scope.testing = false;
            $scope.result = $sce.trustAsHtml(ansi2html.toHtml(response.data.split("Stream :: close")[0]).replace(/\n/g, "<br>"));
          },
          function(response) {
            $scope.testing = false;
            $scope.result = $sce.trustAsHtml(ansi2html.toHtml(response.data.split("Stream :: close")[0]).replace(/\n/g, "<br>"));
          });

      }, function () {

      });

    }
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
