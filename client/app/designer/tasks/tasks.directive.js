'use strict';
const angular = require('angular');

export default angular.module('webAppApp.tasks', [])
  .directive('tasks', function(ansible, $uibModal) {
    return {
      templateUrl: 'app/designer/tasks/tasks.html',
      restrict: 'EA',
      scope: {
        tasksList: '=',
        selectedPlay: '=',
        savePlaybook: '&',
        selectedRole: '=',
        updatePlaybookFileContent: '&',
        executeAnsiblePlayBook: '&',
        files: '=' //List of files for include purpose
      },
      link: function (scope, element, attrs) {
        scope.getModuleFromTask = ansible.getModuleFromTask;

        scope.buttonStates = {loading:false,save:false,err_msg:false};

        scope.tasksMetaData = [];

        scope.$watch('tasksList',function(){
          console.log('tasks list changed');
          scope.tasksMetaData = [];

          angular.forEach(scope.tasksList,function(task){
            ansible.getModuleFromTask(task, taskModule => {
              var taskName = task.name;

              if(taskModule === 'include'){
                taskName = task[taskModule].replace(/(.*yml) .*/,"$1")
              }

              scope.tasksMetaData.push({taskModule:taskModule,taskName:taskName,selected:false})
            });
          })

        },true);


        /**
         * Detect when the user selects tasks.
         * Enable play button if tasks are selected and has tags assigned
         * Enable delete button if tasks are selected
         */
        scope.$watch('tasksMetaData',function(newValue,oldValue){
          scope.selectedTasksPlayButton = false;
          scope.selectedTasksDeleteButton = false

          if(!(scope.tasksMetaData))return;

          var selectedTasks = scope.tasksMetaData.filter(item => item.selected);
          var includeTasks = scope.tasksMetaData.filter(item => item.taskModule === 'include');
          var selectedTasksWithoutTags = [];

          /**
           * Find selected tasks without any tags.
           * If there are any play button will not be enabled
           */
          angular.forEach(scope.tasksMetaData,function(item,index){
            scope.tasksListItem = scope.tasksList[index];
            if(!scope.tasksListItem.tags && item.selected){
              selectedTasksWithoutTags.push(scope.tasksListItem)
            }
          });

          console.log("selectedTasksWithoutTags=")
          console.log(selectedTasksWithoutTags)

          if(selectedTasks.length){
            //if(!includeTasks.length && !selectedTasksWithoutTags.length){
            if(!selectedTasksWithoutTags.length){
              scope.selectedTasksPlayButton = true
            }
            scope.selectedTasksDeleteButton = true

          }else{
            scope.selectedTasksPlayButton = false;
            scope.selectedTasksDeleteButton = false
          }

        },true);


        //scope.moveUp = scope.moveUp();
        //scope.moveDown = scope.moveDown();
        scope.savePlaybook = scope.savePlaybook();
        scope.updatePlaybookFileContent = scope.updatePlaybookFileContent();
        scope.executeAnsiblePlayBook = scope.executeAnsiblePlayBook();

        scope.showTaskModal = function(selectedTaskIndex, copyTask){
          var modalInstance = $uibModal.open({
            animation: true,
            /*templateUrl: 'createTaskContent.html',*/
            templateUrl: 'app/designer/tasks/new_task/new_task.html',
            controller: 'NewTaskController',
            size: 'lg',
            backdrop  : 'static',
            keyboard  : false,
            closeByEscape : false,
            closeByDocument : false,
            resolve: {
              selectedProject: function () {
                return scope.$parent.selectedProject;
              },
              selectedPlay: function(){
                return scope.selectedPlay
              },
              selectedRole: function(){
                return scope.selectedRole
              },
              tasksList: function () {
                return scope.tasksList;
              },
              selectedTaskIndex: function(){
                return selectedTaskIndex
              },
              copyTask : function(){
                return copyTask
              },
              //List of files for include purpose
              files: function(){
                return scope.files
              }
            }
          });

          modalInstance.result.then(
            function (newTask) {
              // if(!selectedTaskIndex)
              //   scope.tasksList.push(newTask);
              scope.updatePlaybookFileContent(true);
              //$scope.selectedPlay = {play: ""};
            }, function () {

            });

        };


        scope.deleteTask = function(index){
          scope.tasksList.splice(index,1);
          scope.updatePlaybookFileContent(true);
        };

        scope.deleteTasks = function(){

          scope.tasksMetaData.filter(function(item, index){
            if(item.selected){
              scope.tasksList.splice(index,1);
            }
          });
          scope.updatePlaybookFileContent(true);
        };


        scope.moveUp = function(list,index,buttonVariable){
          if(!scope.preChangeData) scope.preChangeData = angular.copy(list);
          var temp = angular.copy(list[index]);
          list[index] = list[index-1];
          list[index-1] = temp;

          scope.updatePlaybookFileContent(false);

          scope.buttonStates.save = true

        };

        scope.cancelChange = function(buttonVariable){
          if(scope.preChangeData){
            //scope.tasksList = angular.copy(scope.preChangeData);
            scope.selectedPlay.play.tasks = angular.copy(scope.preChangeData);
            scope.preChangeData = null

          }
          scope.updatePlaybookFileContent(false,null,scope.tasksList);

          scope.buttonStates.save = false;
        };

        scope.moveDown = function(list,index,buttonVariable){
          if(!scope.preChangeData) scope.preChangeData = angular.copy(list);
          var temp = angular.copy(list[index]);
          list[index] = list[index+1];
          list[index+1] = temp;

          scope.updatePlaybookFileContent(false);
          scope.buttonStates.save = true;

        };


        scope.executeSelectedTasks = function(){

          /*var selectedTasks = scope.tasksMetaData.map(function(item){return item.selected});*/
          var selectedTags = [];
          var selectedTaskNames = [];
          /*if(selectedTasks.length){
           selectedTags = selectedTasks.map(function(item){return item.tags});
           selectedTaskNames = selectedTasks.map(function(item){return item.name})
           }*/

          angular.forEach(scope.tasksMetaData, function(item,index){
            if(item.selected){
              if(scope.tasksList[index].tags){
                // As tags is an array and each task can have multiple tags
                var task_tags = scope.tasksList[index].tags
                if(typeof task_tags == 'object')
                  task_tags = task_tags[0]  //task_tags.join(',')
                selectedTags.push(task_tags);
                selectedTaskNames.push(scope.tasksList[index].name)
              }
            }
          });

          if(selectedTags.length){
            var play = scope.selectedPlay && scope.selectedPlay.play;
            scope.executeAnsiblePlayBook(selectedTags,'Tasks',selectedTaskNames.join(","),play)
          }


        };

      }
    };
  })
  .name;
