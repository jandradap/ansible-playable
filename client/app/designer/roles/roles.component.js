'use strict';
const angular = require('angular');

const uiRouter = require('angular-ui-router');

import routes from './roles.routes';

export class RolesComponent {
  /*@ngInject*/
  constructor($scope, ansible, $uibModal, yamlFile, Projects, editor) {
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

    $scope.isopen = {roles: true, filebrowser: false, tasks: false};

    $scope.selectedRole = {role: "", tasks: null};

    $scope.selectedFile = {showSource: true, markdownContent: true, content: ""};

    $scope.editRole = {value: false};
    $scope.showSaveFileButton = false;

    $scope.$on('projectLoaded', function () {
      $scope.getRoles()
    });

    $scope.aceLoaded = function (_editor) {
      _editor.$blockScrolling = Infinity;
    };

    // --------------------------------------- PLAYBOOKS ----------------

    $scope.getRoles = function () {
      ansible.getRoleList(
        function (response) {
          $scope.roles = response.data;
          if(localStorage.selectedRoleName)
            $scope.selectedRole.role = localStorage.selectedRoleName
        },
        function (response) {
          console.log(response.data)
        }
      )
    };

    var getRoleByName = function(roleName){
      var result = null;
      angular.forEach($scope.roles,function(role){
        if(role.name == roleName){
          result = role
        }
      });
      return result;
    };

    if ($scope.$parent.selectedProject && $scope.$parent.selectedProject.ansibleEngine) {
      $scope.getRoles()
    }

    $scope.loadingModuleCode = false;

    $scope.markdownContent = "";

    $scope.showRoleCode = function (role_name) {
      $scope.loadingModuleCode = true;
      $scope.markdownContent = '';
      $scope.docType = 'text';
      $scope.selectedFile.content = 'Loading Role Files..';
      $scope.selectedRole.tasks = null;
      $scope.roleData = null;

      if (!role_name) {
        $scope.selectedFile.content = "Select a module";
        return;
      }
      ansible.getRoleFiles(role_name, function (response) {
        $scope.loadingModuleCode = false;
        $scope.selectedFile.content = JSON.stringify(response.data, null, '\t');
        $scope.docType = 'json';
        $scope.roleData = response.data;

      });
    };

    $scope.$watch('selectedRole.role', function (newValue, oldValue) {
      if (newValue && newValue !== oldValue) {
        $scope.currentRole = newValue;
        $scope.reloadRole();
        //$scope.isopen.roles = false;
        $scope.isopen.filebrowser = true;
        localStorage.selectedRoleName = $scope.selectedRole.role;
      }
    });

    $scope.reloadRole = function () {
      $scope.selectedFile.content = "Loading Code...";
      $scope.docType = 'txt';
      $scope.showRoleCode($scope.currentRole);
    };



    /*var setDocType = function (data, file) {
     if (typeof data == 'object') {
     $scope.selectedFile.content = JSON.stringify(data, null, '\t');
     } else {
     $scope.selectedFile.content = data;
     }

     $scope.docType = editor.ui_ace_doctype_map[file.extension.replace('.', '')];

     if ($scope.docType == 'markdown') {
     $scope.markdownContent = $scope.selectedFile.content;
     $scope.selectedFile.showSource = false;
     }
     };*/

    /**
     * Show selected item in the tree
     * @param file
     * @param parent
     */
    $scope.showSelected = function (file, parent, decrypt) {

      if($scope.editRole.value){
        return
      }


      if (file.children) {
        $scope.selectedFile.content = JSON.stringify(file, null, '\t');
        $scope.docType = 'json';
        $scope.selectedRole.tasks = null;
        return;
      }

      $scope.selectedFile.content = 'Loading..';

      var command = 'cat "' + file.path + '"';
      $scope.encryptedFile = false;
      if(decrypt){
        command = 'ansible-vault view "' + file.path + '" --vault-password-file ~/.vault_pass.txt'
        $scope.encryptedFile = true;
        $scope.selectedFile.content = 'Loading Encrypted File..';
      }

      $scope.selectedFile.showSource = true;
      $scope.markdownContent = '';
      $scope.docType = 'text';

      $scope.selectedRole.tasks = null;
      $scope.selectedFileName = file.name;
      $scope.selectedFilePath = file.path;
      $scope.parentNode = parent;

      ansible.executeCommand(command,
        function (response) {
          $scope.preChangeData = null;
          editor.setContentAndType(response.data, file, $scope.selectedFile);

          var parentDirectory = file.path.replace(/^(.+)\/(.+)\/([^/]+)$/, "$2");
          if (parentDirectory == 'tasks') {
            $scope.selectedRole.tasks = YAML.parse(response.data) || [];
            $scope.isopen.tasks = true;
            $scope.isopen.roles = false;
          }

          if(response.data.indexOf('ANSIBLE_VAULT') > -1){
            editor.setContentAndType('Decrypting content...', file, $scope.selectedFile);
            $scope.showSelected(file, parent, true);
          }

        }, function (response) {
          $scope.selectedFile.content = response.data;

        })
    };

    $scope.showCreateFileModal = function (selectedFile, copyFile) {
      var modalInstance = $uibModal.open({
        animation: true,
        template: require('./new_file/new_file.html'),
        controller: 'NewFileController',
        size: 'md',
        backdrop: 'static',
        keyboard: false,
        closeByEscape: false,
        closeByDocument: false,
        resolve: {
          copyFile: function () {
            return copyFile
          },
          selectedDirectory: function () {
            if (selectedFile.type == 'directory')
              return selectedFile.path;
            else return $scope.parentNode.path
          },
          selectedFileName: function () {
            return selectedFile
          }
        }
      });

      modalInstance.result.then(function () {
        //$scope.getRoles();
        $scope.reloadRole();
      }, function () {

      });
    };

    $scope.showCreateRoleModal = function (copyRole) {
      var modalInstance = $uibModal.open({
        animation: true,
        template: require('./new_role/new_role.html'),
        controller: 'NewRoleController',
        size: 'md',
        backdrop: 'static',
        keyboard: false,
        closeByEscape: false,
        closeByDocument: false,
        resolve: {
          copyRole: function () {
            return copyRole
          },
          selectedRoleName: function () {
            return $scope.selectedRole.role
          }
        }
      });

      modalInstance.result.then(function () {
        $scope.getRoles();
      }, function () {

      });

    };

    $scope.showSearchRoleModal = function () {
      var modalInstance = $uibModal.open({
        animation: true,
        template: require('./search_role/search_role.html'),
        controller: 'SearchRoleController',
        size: 'lg',
        backdrop: 'static',
        keyboard: false,
        closeByEscape: false,
        closeByDocument: false,
        resolve: {
          selectedProject: function () {
            return $scope.$parent.selectedProject
          }
        }
      });

      modalInstance.result.then(function () {
        $scope.getRoles();
      }, function () {

      });

    };


    $scope.saveRole = function () {
      $scope.saveRoleLoading = true;
      ansible.createRole($scope.selectedRole.role, $scope.selectedFile.content,
        function (response) {
          $scope.saveRoleLoading = false;
          $scope.editRole.value = false;
        },
        function (response) {
          $scope.saveRoleLoading = false;
          $scope.err_msg = response.data;
        })
    };

    $scope.deleteRole = function () {
      $scope.deleteRoleLoading = true;
      ansible.deleteRole($scope.selectedRole.role,
        function (response) {
          $scope.deleteRoleLoading = false;
          $scope.selectedRole.role = "";
          $scope.selectedFile.content = "";
          $scope.roleData = null;
          $scope.getRoles();
        },
        function (response) {
          $scope.deleteRoleLoading = false;
          $scope.err_msg = response.data;
          $scope.selectedFile.content = "";
          $scope.roleData = null;
        })
    };

    $scope.loadingButtons = {};
    $scope.showSaveButton = {};

    // ------------- PLAYBOOK ------------------
    $scope.saveTasksFile = function (buttonStates) {

      buttonStates = buttonStates || {};

      buttonStates.loading = true;
      var tasksFileContent = $scope.selectedFile.content;


      ansible.createPlaybook($scope.selectedFilePath, tasksFileContent,
        function (response) {
          buttonStates.loading = false;
          buttonStates.save = false;
        },
        function (response) {
          buttonStates.loading = false;
          buttonStates.save = false;
          buttonStates.err_msg = false;
        })
    };


    $scope.updatePlaybookFileContent = function (save, buttonStates, preChangedData) {
      $scope.selectedRole.tasks = preChangedData || $scope.selectedRole.tasks;
      $scope.selectedFile.content = yamlFile.jsonToYamlFile($scope.selectedRole.tasks, 'Tasks File: ' + $scope.selectedFileName);
      if (save)
        $scope.saveTasksFile(buttonStates);
    };


    $scope.editFile = function (selectedFile) {
      if (selectedFile.type == 'directory')return;

      if (!$scope.preChangeData){
        console.log("No prechanged data, setting pre change data");
        $scope.preChangeData = angular.copy($scope.selectedFile.content);
      }

      $scope.editRole.value = true;
      $scope.showSaveFileButton = true;

    };

    $scope.cancelFileChanges = function (selectedFile) {
      if ($scope.preChangeData) {
        console.log("Replacing content with pre changed data");
        $scope.selectedFile.content = angular.copy($scope.preChangeData);
        $scope.preChangeData = null;
        console.log("Clearing pre changed data")
      }

      $scope.editRole.value = false;
      $scope.showSaveFileButton = false;

    };

    $scope.saveFile = function (selectedFile) {
      $scope.showSaveFileButtonLoading = true;
      $scope.preChangeData = null;
      ansible.updateFile(selectedFile.path, $scope.selectedFile.content,
        function (response) {
          $scope.showSaveFileButtonLoading = false;
          $scope.showSaveFileButton = false;
          $scope.editRole.value = false;
        }, function (error) {
          $scope.showSaveFileButtonLoading = false;
          $scope.err_msg = error.data;
        })

    };

    $scope.deleteFile = function (selectedFile) {
      ansible.deleteFile(selectedFile.path, function (response) {
        $scope.reloadRole();
      }, function (error) {
        $scope.showSaveFileButtonLoading = false;
        $scope.err_msg = error.data;
      })
    };
    // ------------------- EXECUTE PLAYBOOK MODAL -------------

    $scope.executeAnsiblePlayBook = function (tags, executionType, executionName, selectedPlay) {

      var projectRolesFolder = Projects.selectedProject.ansibleEngine.projectFolder + '/roles';
      var rolesFolder = projectRolesFolder + '/' + $scope.selectedRole.role;
      var roleName = $scope.selectedRole.role;

      var modalInstance = $uibModal.open({
        animation: true,
        template: require('../execution/executeModal.html'),
        controller: 'ExecutionController',
        size: 'lg',
        backdrop: 'static',
        keyboard: false,
        closeByEscape: false,
        closeByDocument: false,
        resolve: {
          tags: function () {
            return tags
          },
          selectedProject: function () {
            return Projects.selectedProject
          },
          selectedPlaybook: function () {
            return {playbook: $scope.selectedRole.role + '/tests/test.yml'};
          },
          selectedPlay: function () {
            return selectedPlay
          },
          executionType: function () {
            return executionType
          },
          executionName: function () {
            return executionName
          },
          readOnly: function () {
            return false
          },
          runData: function () {
            return null
          },
          projectFolder: function () {
            return projectRolesFolder
          },
          roleName: function () {
            return roleName
          }
        }
      });
    };
  }
}

export default angular.module('webAppApp.roles', [uiRouter])
  .config(routes)
  .component('roles', {
    template: require('./roles.html'),
    controller: RolesComponent,
    controllerAs: 'rolesCtrl'
  })
  .name;
