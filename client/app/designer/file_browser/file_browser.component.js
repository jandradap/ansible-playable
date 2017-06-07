'use strict';
const angular = require('angular');

const uiRouter = require('angular-ui-router');

import routes from './file_browser.routes';

export class FileBrowserComponent {
  /*@ngInject*/
  constructor($scope,ansible,editor) {
    'ngInject';
    $scope.treeOptions = {
      nodeChildren: "children",
      dirSelectable: true,
      isLeaf: function (node) {
        return !(node.type === 'directory');
      },
      injectClasses: {
        ul: "a1",
        li: "a2",
        liSelected: "a7",
        iExpanded: "a3",
        iCollapsed: "a4",
        iLeaf: "a5",
        label: "a6",
        labelSelected: "a8"
      }
    };

    $scope.editContent = false;
    $scope.selectedFile = {showSource: true};

    var loadProjectFiles = function(){
      ansible.getProjectFiles(function(response){
        $scope.projectFiles = response.data;
      },function(error){

      });
    };

    $scope.$on('projectLoaded',function(){
      loadProjectFiles();
    });

    if($scope.$parent.selectedProject && $scope.$parent.selectedProject.ansibleEngine) {
      loadProjectFiles();
    }

    /**
     * Show selected item in the tree
     * @param file
     * @param parent
     */
    $scope.showSelected = function (file, parent) {

      if (file.children) {
        $scope.selectedFile.content = JSON.stringify(file, null, '\t');
        $scope.docType = 'json';
        $scope.selectedFile.tasks = null;
        return;
      }

      var command = 'cat "' + file.path + '"';
      $scope.showSource = true;
      $scope.markdownContent = '';
      $scope.docType = 'text';
      $scope.selectedFile.content = 'Loading..';
      $scope.selectedFile.tasks = null;
      $scope.selectedFileName = file.name;
      $scope.selectedFilePath = file.path;
      $scope.parentNode = parent;

      ansible.executeCommand(command,
        function (response) {
          console.log(response.data)
          editor.setContentAndType(response.data, file, $scope.selectedFile);

          var parentDirectory = file.path.replace(/^(.+)\/(.+)\/([^/]+)$/, "$2");
          if (parentDirectory == 'tasks') {
            $scope.selectedFile.tasks = YAML.parse(response.data) || [];
          }

          if (parentDirectory == 'group_vars' || parentDirectory == 'host_vars') {
            $scope.selectedFile.docType = 'yaml';
          }

          //$scope.selectedFile.content = response.data;

        }, function (response) {
          $scope.selectedFile.content = response.data;

        })
    };
  }
}

export default angular.module('webAppApp.file_browser', [uiRouter])
  .config(routes)
  .component('fileBrowser', {
    template: require('./file_browser.html'),
    controller: FileBrowserComponent,
    controllerAs: 'fileBrowserCtrl'
  })
  .name;
