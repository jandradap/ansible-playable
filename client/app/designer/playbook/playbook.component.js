'use strict';
const angular = require('angular');

const uiRouter = require('angular-ui-router');

import routes from './playbook.routes';

export class PlaybookComponent {
  /*@ngInject*/
  constructor($scope,$uibModal,YAML,ansible,yamlFile) {
    'ngInject';
    $scope.isopen = {playbooks:true,plays:false,tasks:false};

    $scope.selectedPlaybook = {playbook: "",content: ""};
    $scope.selectedPlay = {play: ""};

    $scope.showSaveButton = {};
    $scope.loadingButtons = {};

    $scope.editPlaybook = {value:false};

    $scope.loadingModuleCode = false;

    $scope.$on('projectLoaded',function(){
      $scope.getPlaybooks()
    });

    //To fix a warning message in console
    $scope.aceLoaded = function(_editor){
      _editor.$blockScrolling = Infinity;
    };

    // --------------------------------------- PLAYBOOKS ----------------

    $scope.getPlaybooks = function(){
      ansible.getPlaybookList(
        function(response){
          $scope.playbooks = response.data;
        },
        function(response){
          console.log(response.data)
        }
      )
    };


    if($scope.$parent.selectedProject && $scope.$parent.selectedProject.ansibleEngine){
      $scope.getPlaybooks()
    }

    $scope.showPlaybookCode = function(playbook_name){
      $scope.loadingModuleCode = true;

      if(!playbook_name){
        $scope.selectedPlaybook.content = "Select a module";
        return;
      }
      ansible.readPlaybook(playbook_name,function(response) {
        $scope.isopen.playbooks = true;
        $scope.isopen.plays = true
        $scope.loadingModuleCode = false;
        $scope.selectedPlaybook.content = response.data.split("Stream :: close")[0];
        $scope.getPlaysFromPlayBook($scope.selectedPlaybook.content);

      });
    };

    $scope.$watch('selectedPlaybook.playbook',function(newValue,oldValue){
      if(newValue && newValue !== oldValue){
        $scope.selectedPlaybook.content = "Loading Code...";
        $scope.showPlaybookCode(newValue);
      }
    });

    $scope.$watch('selectedPlay.play',function(newValue,oldValue){
      if(newValue && newValue !== oldValue){
        $scope.selectedPlay.play.tasks = $scope.selectedPlay.play.tasks || [];
        $scope.isopen.playbooks = false;
        $scope.isopen.plays = false;
        $scope.isopen.tasks = true;
        $scope.isopen.roles = true;
      }
    });


    $scope.showCreatePlaybookModal = function(){
      var modalInstance = $uibModal.open({
        animation: true,
        /*templateUrl: 'createTaskContent.html',*/
        templateUrl: 'app/designer/playbook/new_playbook/new_playbook.html',
        controller: 'NewPlaybookController',
        size: 'md',
        backdrop  : 'static',
        keyboard  : false,
        closeByEscape : false,
        closeByDocument : false,
        resolve: {
          selectedProject: function(){
            return $scope.$parent.selectedProject
          }
        }
      });

      modalInstance.result.then(function () {
        $scope.getPlaybooks();
      }, function () {

      });

    };

    $scope.editPlaybookMethod = function(){
      $scope.editPlaybook.value = true;
      $scope.uneditedPlaybokContents = $scope.selectedPlaybook.content
    };

    $scope.cancelPlaybookChanges = function(){
      $scope.editPlaybook.value = false;
      $scope.selectedPlaybook.content = $scope.uneditedPlaybokContents
    };

    $scope.savePlaybook = function(buttonVariable){
      console.log("Saving Playbook")
      $scope.loadingButtons[buttonVariable] = true;

      ansible.createPlaybook($scope.selectedPlaybook.playbook,$scope.selectedPlaybook.content,
        function(response){
          $scope.loadingButtons[buttonVariable] = false;
          $scope.showSaveButton[buttonVariable] = false;
          $scope.editPlaybook.value = false;
        },
        function(response){
          $scope.loadingButtons[buttonVariable] = false;
          $scope.showSaveButton[buttonVariable] = false;
          $scope.err_msg = response.data;
        })
    };

    $scope.deletePlaybook = function(){
      $scope.deletePlaybookLoading = true;
      ansible.deletePlaybook($scope.selectedPlaybook.playbook,
        function(response){
          $scope.deletePlaybookLoading = false;
          $scope.selectedPlaybook.playbook = "";
          $scope.getPlaybooks();
        },
        function(response){
          $scope.deletePlaybookLoading = false;
          $scope.err_msg = response.data;
        })
    };


    //--------------- PLAY --------------

    $scope.showCreatePlayModal = function(selectedPlayIndex){
      var modalInstance = $uibModal.open({
        animation: true,
        /*templateUrl: 'createPlayContent.html',*/
        templateUrl: 'app/designer/playbook/new_play/new_play.html',
        controller: 'NewPlayController',
        size: 'lg',
        backdrop  : 'static',
        keyboard  : false,
        closeByEscape : false,
        closeByDocument : false,
        resolve: {
          selectedProject: function () {
            return $scope.$parent.selectedProject;
          },
          plays: function () {
            return $scope.plays;
          },
          selectedPlayIndex: function () {
            return selectedPlayIndex;
          }
        }
      });

      modalInstance.result.then(
        function (newPlay) {
          if(selectedPlayIndex == null)
            $scope.plays.push(newPlay);

          $scope.clearEmptyTasks($scope.plays);

          $scope.selectedPlaybook.content = yamlFile.jsonToYamlFile($scope.plays, 'Playbook file: ' +  $scope.selectedPlaybook.playbook)
          $scope.savePlaybook();
        }, function () {

        });

    };


    // FUNCTION - GET PLAYS FROM PLAYBOOK

    $scope.getPlaysFromPlayBook = function(playbookYamlData){
      $scope.plays = YAML.parse(playbookYamlData) || []
    };

    // FUNCTION - DELETE PLAY

    $scope.deletePlay = function(index){
      $scope.plays.splice(index,1);
      $scope.selectedPlaybook.content = yamlFile.jsonToYamlFile($scope.plays, 'Playbook file: ' +  $scope.selectedPlaybook.playbook)
      $scope.savePlaybook();
      $scope.selectedPlay = {play: ""};
    };

    // ------------------- EXECUTE PLAYBOOK MODAL -------------

    $scope.executeAnsiblePlayBook = function(tags,executionType,executionName,selectedPlay){
      console.log("Tags type" + typeof tags)
      var modalInstance = $uibModal.open({
        animation: true,
        /*templateUrl: 'createTaskContent.html',*/
        templateUrl: 'app/designer/execution/executeModal.html',
        controller: 'ExecutionController',
        size: 'lg',
        backdrop  : 'static',
        keyboard  : false,
        closeByEscape : false,
        closeByDocument : false,
        resolve: {
          tags: function(){
            return tags
          },
          selectedProject: function(){
            return $scope.$parent.selectedProject
          },
          selectedPlaybook: function(){
            return $scope.selectedPlaybook
          },
          selectedPlay: function(){
            return selectedPlay
          },
          executionType: function(){
            return executionType
          },
          executionName: function(){
            return executionName
          },
          readOnly: function(){
            return false
          },
          runData: function(){
            return null
          },
          projectFolder: function(){
            return null
          },
          roleName: function(){
            return null
          }
        }
      });
    };


    $scope.clearEmptyTasks = function(plays){
      //Check for empty tasks list
      angular.forEach(plays,function(play){
        if((play.tasks && !play.tasks.length) || !play.tasks){
          delete play.tasks
        }
      });

    };

    // ---------------------- TASKS -------------------

    $scope.updatePlaybookFileContent = function(save,buttonVariable){

      var playsCopy = angular.copy($scope.plays);

      $scope.clearEmptyTasks(playsCopy);

      $scope.selectedPlaybook.content = yamlFile.jsonToYamlFile(playsCopy, 'Playbook file: ' +  $scope.selectedPlaybook.playbook)
      if(save)
        $scope.savePlaybook(buttonVariable);
    };

    $scope.moveUp = function(list,index,buttonVariable){
      if(!$scope.preChangeData) $scope.preChangeData = angular.copy(list);
      var temp = angular.copy(list[index]);
      list[index] = list[index-1];
      list[index-1] = temp;

      $scope.updatePlaybookFileContent(false);

      $scope.showSaveButton[buttonVariable] = true

    };

    $scope.cancelChange = function(buttonVariable){
      if($scope.preChangeData){
        $scope.plays = angular.copy($scope.preChangeData);
        $scope.preChangeData = null

      }
      $scope.updatePlaybookFileContent(false);

      $scope.showSaveButton[buttonVariable] = false
    };

    $scope.moveDown = function(list,index,buttonVariable){
      if(!$scope.preChangeData) $scope.preChangeData = angular.copy(list);
      var temp = angular.copy(list[index]);
      list[index] = list[index+1];
      list[index+1] = temp;

      $scope.updatePlaybookFileContent(false);

      $scope.showSaveButton[buttonVariable] = true

    };
  }
}

export default angular.module('webAppApp.playbook', [uiRouter])
  .config(routes)
  .component('playbook', {
    template: require('./playbook.html'),
    controller: PlaybookComponent,
    controllerAs: 'playbookCtrl'
  })
  .name;
