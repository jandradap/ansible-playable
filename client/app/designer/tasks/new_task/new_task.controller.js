'use strict';
const angular = require('angular');



/*@ngInject*/
export function newTaskController($window, $scope, $sce, $uibModal, ansi2html, ansible, $uibModalInstance, tasksList, selectedTaskIndex, copyTask, files, selectedPlay, selectedRole, $filter, Projects) {
  var selectedTask;

  /**
   * Edit task - in case of edit task , selectedTaskIndex is not null.
   * Set selectedTask to a copy of selected task to edit.
   */
  if(selectedTaskIndex > -1 && tasksList){
    if(copyTask){
      selectedTask = angular.copy(tasksList[selectedTaskIndex]);
      selectedTask.name = "Copy of " + selectedTask.name;
      selectedTaskIndex = null;
    }else{
      selectedTask = tasksList[selectedTaskIndex]
    }

  }

  /**
   * List of files for include purpose
   */
  if(files){
    $scope.files = files;
  }

  $scope.getModuleDescriptionLoading = false;
  $scope.modulesLoading = false;

  $scope.modules = null;
  $scope.singeLineModules = ["shell"];
  $scope.showHelp = false;

  $scope.newTask = {};
  $scope.title = "New Task";
  $scope.createTaskLoading = false;

  /**
   * Get Ansible Modules
   * If Edit Task, get module description for selected task
   */
  $scope.getAnsibleModules = function(){
    $scope.modulesLoading = true;
    ansible.getAnsibleModules(function(response){
      $scope.modules = response;
      $scope.modulesLoading = false;

      if(selectedTask){
        $scope.title = "Edit Task";
        selectedTask = angular.copy(selectedTask);
        $scope.newTask = selectedTask;
        if(selectedTask.tags)$scope.newTask.tags = $scope.newTask.tags.join(',');
        $scope.getModuleFromTask(selectedTask, module => {
          $scope.getModuleDescription(module,true)
        });
      }

    }, function(response){
      $scope.result = $sce.trustAsHtml(ansi2html.toHtml(response.data).replace(/\n/g, "<br>").replace(/ /g,"&nbsp;"));

    });

  };


  /**
   * Get Module Description whenever a module is selected by the user
   * @param module - Module Object
   * @param override - Override variables in case of edit task
   * @param refresh - Refresh module description from server. Don't display from cache
   */
  $scope.getModuleDescription = function(module,override,refresh){

    if(!module)return;

    var module_copy = angular.copy(module);

    $scope.getModuleDescriptionLoading = true;
    var moduleName = module.name;

    if($scope.singeLineModules.indexOf(moduleName) > -1){
      module.singleLine = true;
    }

    $scope.detailHelp = "";
    $scope.examples = "";
    module.variables = [];

    ansible.getAnsibleModuleDescription(moduleName,
      function(response){
        $scope.showHelp = true;
        $scope.result = $sce.trustAsHtml(ansi2html.toHtml(response).replace(/\n/g, "<br>").replace(/ /g,"&nbsp;"));

        $scope.detailHelp = response;
        $scope.examples = response.substr(response.indexOf("#"));
        //var re = /(^[-=] .*)/gm;
        //var re = /(^[-=] .*)[^]*?(?:(\(Choices[^]+?\))?\s*(\[.*\])|(?=^[-=]|^EXAMPLES))/gm;
        var re = /(^[-=] .*)([^]*?)(?:(\(Choices[^]+?\))?\s*(\[.*\])|(?=^[-=]|^EXAMPLES))/gm;
        var m;

        while ((m = re.exec($scope.detailHelp.split("EXAMPLES")[0]+"EXAMPLES")) !== null) {
          //while ((m = re.exec($scope.detailHelp.split("#")[0])) !== null) {
          //while ((m = re.exec($scope.detailHelp)) !== null) {
          if (m.index === re.lastIndex) {
            re.lastIndex++;
          }
          // View your result using the m-variable.
          // eg m[0] etc.

          var option_name = m[1];
          var description = m[2];
          var choices = m[3];
          var default_value = m[4];


          var breakup = option_name.split(" ");
          var variable_name = breakup[1];
          var mandatory = breakup[0] == "=";

          var complex_value = {};

          if(default_value)
            default_value = default_value.replace(/\[Default: (.*)\]/,"$1");

          if(default_value == 'None')
            default_value = null

          var variable_value = default_value || '';

          if(choices)
            choices = choices.replace(/\s+/g,"").replace(/\n\s+/g,"").replace(/\(Choices:(.*)\)/,"$1").split(",");

          if(override && module_copy.variables){
            var matching_variable = module_copy.variables.filter(function(item){
              if(item.name == variable_name){
                return true
              }
            });
            if(matching_variable.length){
              variable_value = matching_variable[0].value;
              if(typeof variable_value=='object'){
                complex_value  = angular.copy(variable_value)
              }
            }

          }

          module.variables.push({name:variable_name,description:description,mandatory:mandatory,value:variable_value,complexValue:complex_value,choices:choices,default_value:default_value});
          $scope.getModuleDescriptionLoading = false;
        }
      }, function(response){
        $scope.result = $sce.trustAsHtml(ansi2html.toHtml(response.data).replace(/\n/g, "<br>"));
        console.log(ansi2html.toHtml(response.data));
        $scope.detailHelp = response.data;
        $scope.getModuleDescriptionLoading = false;
      },refresh)
  };

  /**
   * Reload Module Description and variables. Ignore displaying from cache.
   * Used when a custom module is updated and description and variables info need to be updated.
   * @param module - module object
   */
  $scope.reloadModuleDetails = function(module){

    if(selectedTask){
      $scope.getModuleDescription(module,true,true)
    }else{
      $scope.getModuleDescription(module,false,true)
    }
  };


  /**
   * Identify module from a given task object.
   * @param task - Single task object containing task properties
   * @returns {{}}
   */
  $scope.getModuleFromTask = function(task, successCallback){
    var moduleObject = {};
    $scope.local_action = false;
    var task_properties = null;

    ansible.getModuleFromTask(task, module => {
      if(module === 'include'){
        module = null;
        task.tags = task.include.replace(/.*tags=(.*)/,"$1")
        return;
      }else if(module === 'local_action'){
        $scope.local_action = true;
        module = task.local_action.module;
        task_properties = task.local_action;
        delete task_properties.module;
      }else{
        task_properties = task[module];
      }

      angular.forEach($scope.modules, function(item,index) {
        if(item.name == module){
          moduleObject = item;
          $scope.newTask.module = item;
        }
      });


      if(!(moduleObject && moduleObject.name)){
        $scope.err_msg = "Unable to find module " + module + " in Ansible controller";
        return
      }

      //moduleObject.name = module;
      moduleObject.variables = [];
      if(typeof task_properties == "string"){
        moduleObject.variables.push({'name':'free_form','value':task_properties});

        var re = /\b(\w+)=\s*([^=]*\S)\b\s*(?=\w+=|$)/g;
        var m;

        while ((m = re.exec(task_properties)) !== null) {
          if (m.index === re.lastIndex) {
            re.lastIndex++;
          }
          // View your result using the m-variable.
          // eg m[0] etc.
          var k=m[1];
          var v=m[2];
          moduleObject.variables.push({'name':k,'value':v})
        }

      }else if(typeof task_properties == "object"){

        angular.forEach(task_properties,function(value,key){
          this.push({'name':key,'value':value,'complexValue':value})
        },moduleObject.variables)

      }
      successCallback(moduleObject);
    });



  };

  /**
   * Create Task - Creates new task object and set task variables.
   * Push new task object to tasksList
   * Close new task modal
   */
  $scope.createTask = function(){

    if(!$scope.newTask.module && !$scope.newTask.include){
      $scope.err_msg = "Must select atleast one module or include statement";
      return
    }

    $scope.createTaskLoading = true;

    if(!tasksList){
      tasksList = []
    }

    var taskObject = {name:$scope.newTask.name};

    if($scope.newTask.include)
      taskObject['include'] = $scope.newTask.include;

    if($scope.newTask.tags)
      taskObject['tags'] = $scope.newTask.tags.split(',');

    if($scope.newTask.register)
      taskObject['register'] = $scope.newTask.register;

    if($scope.newTask.async){
      taskObject['async'] = $scope.newTask.async;
      if(!$scope.newTask.poll)
        $scope.newTask.poll = 10;
      taskObject['poll'] = $scope.newTask.poll;
    }

    var variablesObject = null;
    if($scope.newTask.module){
      if($scope.newTask.module.singleLine){
        variablesObject = "";
        //Add all mandatory variables first
        angular.forEach($scope.newTask.module.variables.filter(function(item){
          return item.mandatory
        }),function(item){
          if(item.name == 'free_form'){
            variablesObject += item.value;
          }else if(item.value){
            variablesObject += " " + item.name + "=" + item.value;
          }
        });

        //Add optional variables
        angular.forEach($scope.newTask.module.variables.filter(function(item){
          return !item.mandatory
        }),function(item){
          if(item.value != item.default_value){
            if(item.name == 'free_form'){
              variablesObject += item.value;
            }else if(item.value){
              variablesObject += " " + item.name + "=" + item.value;
            }
          }
        });

      }else{
        variablesObject = {};
        angular.forEach($scope.newTask.module.variables,function(item){
          if((item.value || (item.isComplexVariable && item.complexValue)) && item.value != item.default_value){
            if(item.isComplexVariable){
              variablesObject[item.name] = item.complexValue;
            }else{
              variablesObject[item.name] = item.value;
            }

          }
        });
      }

      taskObject[$scope.newTask.module.name] = variablesObject;

      if($scope.local_action){
        variablesObject.module = $scope.newTask.module.name;
        taskObject['local_action'] = variablesObject;
      }
    }



    if(selectedTaskIndex != null){
      // If Edit Task

      tasksList[selectedTaskIndex] = taskObject

    }else{
      // If New Task

      tasksList.push(taskObject);
    }

    $uibModalInstance.close(taskObject);
  };

  /**
   * Close modal
   */
  $scope.ok = function () {
    $uibModalInstance.close($scope.newTask);
  };


  /**
   * Cancel modal
   */
  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };

  /**
   * Get host variables using Ansible Python API in the backend
   */
  $scope.getHostVars = function(){

    if(!(selectedPlay && selectedPlay.play && selectedPlay.play.hosts))return;

    ansible.getVars(Projects.selectedInventoryFileName,selectedPlay.play.hosts,function(response){
      console.log(response.data);
      if(response.data.length)
        $scope.hostvars = $filter('dictToKeyValueArray')(response.data[0]);
      else $scope.err_msg = "Getting host variables - No variables returned" ;

    },function(error){
      console.log(error.data);
      $scope.err_msg = "Getting host variables - " + error.data;
    })
  };

  if(selectedPlay)
    $scope.getHostVars();


  $scope.getRoleVars = function(){

    if(!(selectedRole && selectedRole.role))return;

    ansible.getRoleVars(selectedRole.role,function(response){
      console.log(response.data);
      if(response.data)
        $scope.hostvars = $filter('dictToKeyValueArray')(response.data);
      else $scope.err_msg = "Getting host variables - No variables returned" ;

    },function(error){
      console.log(error.data);
      $scope.err_msg = "Getting host variables - " + error.data;
    })
  };

  if(selectedRole)
    $scope.getRoleVars();


  if(!$scope.modules){
    $scope.getAnsibleModules();
  }

  $scope.showComplexVariable = function(variable){
    variable.isComplexVariable = true;
    var modalInstance = $uibModal.open({
      animation: true,
      /*templateUrl: 'createTaskContent.html',*/
      templateUrl: 'app/modals/complex_var_modal/complexVariable.html',
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
          return $scope.hostvars
        },
        members: function(){
          return variable.complexValue
        }
      }
    });

    modalInstance.result.then(function (selectedItem) {
      variable.complexValue = selectedItem
    }, function () {

    });

  }
}

export default angular.module('webAppApp.new_task', [])
  .controller('NewTaskController', newTaskController)
  .name;
