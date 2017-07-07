'use strict';
const angular = require('angular');

/*@ngInject*/
export function ansibleService($http, YAML, Projects) {
  // AngularJS will instantiate a singleton by calling "new" on this function
  // AngularJS will instantiate a singleton by calling "new" on this function

  var AnsibleService = this;

  var uri = '/api/ansible/';
  var emptyPlaybookContent = '---\n# Playbook File -';
  var defaultTaskProperties = ["variables", "tags", "name", "notify", "with_items", "first_available_file", "only_if", "user", "sudo", "connection", "when", "register", "ignore_errors", "selected", "changed_when", "delegate_to", "vars", "poll", "async", "args", "with_together"];


  // A Cache Map of hosts and modules list. Different hosts(Ansible Engines) can have different list of modules
  AnsibleService.modules = {};

  // A cache map of hosts and modules names.
  AnsibleService.module_names = {};

  // A local command bugger to wait for a command execution to finish, to avoid duplicate executions
  AnsibleService.cmd_buffer = [];

  /**
   * Get Ansible Modules
   * @param successCallback
   * @param errorCallback
   * @param parent
   * @param refresh - Weather to force a refresh of list of modules from server.
   *                  If false uses modules list from browser cache.
   * @returns {*}
   */
  this.getAnsibleModules = function (successCallback, errorCallback, parent, refresh) {

    if (this.cmd_buffer.indexOf(Projects.selectedProject.ansibleEngine.ansibleHost) > -1) {
      // We're just waiting.
      setTimeout(function(){
        //do what you need here
        AnsibleService.getAnsibleModules(successCallback, errorCallback, parent, refresh);
      }, 1000);
      return;
    }

    if (!refresh && AnsibleService.modules[Projects.selectedProject.ansibleEngine.ansibleHost])
      return successCallback(AnsibleService.modules[Projects.selectedProject.ansibleEngine.ansibleHost]);

    try {
      if (!refresh && JSON.parse(localStorage['modules_' + Projects.selectedProject.ansibleEngine.ansibleHost]))
        return successCallback(JSON.parse(localStorage['modules_' + Projects.selectedProject.ansibleEngine.ansibleHost]));
    } catch (e) {
      //console.error(e)
    }

    // If not found in local browser cache, retrieve from server

    AnsibleService.cmd_buffer.push(Projects.selectedProject.ansibleEngine.ansibleHost);

    $http.post(uri + 'modules/list', {ansibleEngine: Projects.selectedProject.ansibleEngine}).then(function (response) {
      var result = response.data.split('\n');
      AnsibleService.modules[Projects.selectedProject.ansibleEngine.ansibleHost] = result.map(function (item) {
        return {"name": item.split(" ")[0], "description": item.split(/ (.+)?/)[1]}
      });

      AnsibleService.module_names[Projects.selectedProject.ansibleEngine.ansibleHost] = AnsibleService.modules[Projects.selectedProject.ansibleEngine.ansibleHost].map(module => {
        return module.name;
      });

      localStorage['modules_' + Projects.selectedProject.ansibleEngine.ansibleHost] = JSON.stringify(AnsibleService.modules[Projects.selectedProject.ansibleEngine.ansibleHost]);

      AnsibleService.cmd_buffer.splice(AnsibleService.cmd_buffer.indexOf(Projects.selectedProject.ansibleEngine.ansibleHost), 1)

      successCallback && successCallback(AnsibleService.modules[Projects.selectedProject.ansibleEngine.ansibleHost]);

    }, errResponse => {
      this.cmd_buffer.splice(this.cmd_buffer.indexOf(Projects.selectedProject.ansibleEngine.ansibleHost), 1);
      errorCallback && errorCallback(errResponse)
    })
  };

  this.getAnsibleModuleNames = function (successCallback, errorCallback, refresh) {
    if (!refresh && AnsibleService.module_names[Projects.selectedProject.ansibleEngine.ansibleHost])
      return successCallback(AnsibleService.module_names[Projects.selectedProject.ansibleEngine.ansibleHost]);

    this.getAnsibleModules(function () {
      successCallback(AnsibleService.module_names[Projects.selectedProject.ansibleEngine.ansibleHost]);
    }, errorCallback, null, refresh);

  };


  this.getAnsibleModuleDescription = function (moduleName, successCallback, errorCallback, refresh) {

    try {
      if (!refresh && JSON.parse(localStorage['module_description_' + Projects.selectedProject.ansibleEngine.ansibleHost + '_' + moduleName]))
        return successCallback(JSON.parse(localStorage['module_description_' + Projects.selectedProject.ansibleEngine.ansibleHost + '_' + moduleName]));
    } catch (e) {

    }

    var command = 'ansible-doc ' + moduleName;

    if (Projects.selectedProject.ansibleEngine.customModules) {
      command = 'export ANSIBLE_LIBRARY="' + Projects.selectedProject.ansibleEngine.customModules + '"; ' + command;
    }

    $http.post(uri + 'command', {ansibleEngine: Projects.selectedProject.ansibleEngine, command: command})
      .then(function (response) {

        localStorage['module_description_' + Projects.selectedProject.ansibleEngine.ansibleHost + '_' + moduleName] = JSON.stringify(response.data);
        successCallback(response.data)

      }, errorCallback)

  };

  this.executeAnsiblePlayBook = function (body, successCallback, errorCallback, parent) {
    $http.post(uri + 'execute', body).then(successCallback, errorCallback)
  };

  this.executeCommand = function (command, successCallback, errorCallback) {
    $http.post(uri + 'command', {
      command: command,
      ansibleEngine: Projects.selectedProject.ansibleEngine
    }).then(successCallback, errorCallback)
  };

  this.getLogs = function (executionData, successCallback, errorCallback) {
    $http.get(uri + 'logs/' + executionData._id).then(successCallback, errorCallback);
  };

  this.query = function (successCallback, errorCallback) {
    $http.get(uri + 'runs').then(successCallback, errorCallback);
  };

  this.getModuleFromTask = function (task, successCallback, errorCallback) {
    var module = null;
    console.log("Getting module from task");


    this.getAnsibleModuleNames(modules => {

      angular.forEach(JSON.parse(angular.toJson(task)), (value, key) => {
        if (modules.indexOf(key) > -1) {
          module = key
        }
      });

      if (module === 'include' && !task.tags && task.include.indexOf('tags') > -1) {
        task.tags = task.include.replace(/.*tags=(.*)/, "$1")
      }

      successCallback(module);

    }, errorCallback);


  };
  // --------------------------   PROJECT  -------------------------
  this.getProjectFiles = function (successCallback, errorCallback) {
    $http.post(uri + 'project/files', {ansibleEngine: Projects.selectedProject.ansibleEngine}).then(successCallback, errorCallback)
  };


  // --------------------------   PLAYBOOK -------------------------

  this.getPlaybookList = function (successCallback, errorCallback) {
    $http.post(uri + 'playbook/list', {ansibleEngine: Projects.selectedProject.ansibleEngine}).then(successCallback, errorCallback)
  };

  this.deletePlaybook = function (playbookName, successCallback, errorCallback) {

    $http.post(uri + 'playbook/delete', {
      ansibleEngine: Projects.selectedProject.ansibleEngine,
      playbookName: playbookName
    }).then(successCallback, errorCallback)

  };

  this.createPlaybook = function (playbookName, playbookFileContents, successCallback, errorCallback) {
    var playbookContent = playbookFileContents || (emptyPlaybookContent + playbookName);
    $http.post(uri + 'playbook/create', {
      ansibleEngine: Projects.selectedProject.ansibleEngine,
      playbookName: playbookName,
      playbookFileContents: playbookContent
    }).then(successCallback, errorCallback)
  };

  this.readPlaybook = function (playbookName, successCallback, errorCallback) {
    $http.post(uri + 'playbook/get', {
      ansibleEngine: Projects.selectedProject.ansibleEngine,
      playbookName: playbookName
    }).then(successCallback, errorCallback)
  };

  this.readPlaybookData = function (playbookData) {
    return YAML.parse(playbookData)
  };

  // --------------------------   ROLES -------------------------

  this.getRoleList = function (successCallback, errorCallback) {
    $http.post(uri + 'roles/list', {ansibleEngine: Projects.selectedProject.ansibleEngine}).then(successCallback, errorCallback)
  };

  this.searchRolesGalaxy = function (searchText, successCallback, errorCallback) {
    $http.post(uri + 'roles/search/galaxy', {
      searchText: searchText,
      ansibleEngine: Projects.selectedProject.ansibleEngine
    }).then(successCallback, errorCallback)
  };

  this.searchRolesGithub = function (searchText, successCallback, errorCallback) {
    $http.post(uri + 'roles/search/github', {
      searchText: searchText,
      ansibleEngine: Projects.selectedProject.ansibleEngine
    }).then(successCallback, errorCallback)
  };

  this.createRole = function (roleName, successCallback, errorCallback, selectedRoleName) {
    $http.post(uri + 'roles/create', {
      roleName: roleName,
      selectedRoleName: selectedRoleName,
      ansibleEngine: Projects.selectedProject.ansibleEngine
    }).then(successCallback, errorCallback)
  };

  this.importRole = function (roleType, roleNameUri, successCallback, errorCallback) {
    $http.post(uri + 'roles/import', {
      roleType: roleType,
      roleNameUri: roleNameUri,
      ansibleEngine: Projects.selectedProject.ansibleEngine
    }).then(successCallback, errorCallback)
  };

  this.deleteRole = function (roleName, successCallback, errorCallback) {
    $http.post(uri + 'roles/delete', {
      roleName: roleName,
      ansibleEngine: Projects.selectedProject.ansibleEngine
    }).then(successCallback, errorCallback)
  };

  this.getRoleFiles = function (roleName, successCallback, errorCallback) {
    $http.post(uri + 'roles/files', {
      roleName: roleName,
      ansibleEngine: Projects.selectedProject.ansibleEngine
    }).then(successCallback, errorCallback)
  };

  // --------------------------   FILES -------------------------

  this.createFile = function (fileAbsolutePath, successCallback, errorCallback, selectedFileName) {
    $http.post(uri + 'files/create', {
      fileAbsolutePath: fileAbsolutePath,
      selectedFileName: selectedFileName,
      ansibleEngine: Projects.selectedProject.ansibleEngine
    }).then(successCallback, errorCallback)
  };

  this.updateFile = function (fileAbsolutePath, fileContents, successCallback, errorCallback, selectedFileName) {
    $http.post(uri + 'files/update', {
      fileAbsolutePath: fileAbsolutePath,
      fileContents: fileContents,
      selectedFileName: selectedFileName,
      ansibleEngine: Projects.selectedProject.ansibleEngine
    }).then(successCallback, errorCallback)
  };

  this.deleteFile = function (fileAbsolutePath, successCallback, errorCallback, selectedFileName) {
    $http.post(uri + 'files/delete', {
      fileAbsolutePath: fileAbsolutePath,
      selectedFileName: selectedFileName,
      ansibleEngine: Projects.selectedProject.ansibleEngine
    }).then(successCallback, errorCallback)
  };

  // --------------------------   INVENTORY -------------------------

  this.getInventoryList = function (successCallback, errorCallback, projectFolder) {
    // Override project folder for other cases, such as roles
    var ansibleEngine = Projects.selectedProject.ansibleEngine;
    if (projectFolder) {
      ansibleEngine = angular.copy(Projects.selectedProject.ansibleEngine);
      ansibleEngine.projectFolder = projectFolder
    }
    $http.post(uri + 'inventory/list', {ansibleEngine: ansibleEngine}).then(successCallback, errorCallback)
  };

  this.readInventory = function (inventoryName, successCallback, errorCallback) {
    $http.post(uri + 'inventory/get', {
      inventoryName: inventoryName,
      ansibleEngine: Projects.selectedProject.ansibleEngine
    }).then(successCallback, errorCallback)
  };

  this.deleteInventory = function (inventoryName, successCallback, errorCallback) {
    $http.post(uri + 'inventory/delete', {
      ansibleEngine: Projects.selectedProject.ansibleEngine,
      inventoryName: inventoryName
    }).then(successCallback, errorCallback)
  };

  this.createInventory = function (inventoryName, inventoryFileContents, successCallback, errorCallback) {
    $http.post(uri + 'inventory/create', {
      ansibleEngine: Projects.selectedProject.ansibleEngine,
      inventoryName: inventoryName,
      inventoryFileContents: inventoryFileContents
    }).then(successCallback, errorCallback)
  };

  // --------------------------   Variable Files -------------------------

  this.getVars = function (inventoryFileName, hostName, successCallback, errorCallback) {
    $http.post(uri + 'vars/hosts/get', {
      ansibleEngine: Projects.selectedProject.ansibleEngine,
      hostName: hostName,
      inventoryFileName: inventoryFileName
    }).then(successCallback, errorCallback)
  };

  this.getRoleVars = function (roleName, successCallback, errorCallback) {
    $http.post(uri + 'vars/roles/get', {
      ansibleEngine: Projects.selectedProject.ansibleEngine,
      roleName: roleName
    }).then(successCallback, errorCallback)
  };

  this.updateGroupVarsFile = function (groupName, groupVarsContents, successCallback, errorCallback) {
    $http.post(uri + 'vars_file/groups/update', {
      ansibleEngine: Projects.selectedProject.ansibleEngine,
      groupName: groupName,
      groupVarsContents: groupVarsContents
    }).then(successCallback, errorCallback)
  };

  this.getGroupVarsFile = function (groupName, successCallback, errorCallback) {
    $http.post(uri + 'vars_file/groups/get', {
      ansibleEngine: Projects.selectedProject.ansibleEngine,
      groupName: groupName
    }).then(successCallback, errorCallback)
  };

  this.updateHostVarsFile = function (hostName, hostVarsContents, successCallback, errorCallback) {
    $http.post(uri + 'vars_file/hosts/update', {
      ansibleEngine: Projects.selectedProject.ansibleEngine,
      hostName: hostName,
      hostVarsContents: hostVarsContents
    }).then(successCallback, errorCallback)
  };

  this.getHostVarsFile = function (hostName, successCallback, errorCallback) {
    $http.post(uri + 'vars_file/hosts/get', {
      ansibleEngine: Projects.selectedProject.ansibleEngine,
      hostName: hostName
    }).then(successCallback, errorCallback)
  };

  // ------------------- TAGS LIST --------------------------

  this.getTagList = function (selectedPlaybook, inventory_file_name, ansibleEngine, successCallback, errorCallback) {
    $http.post(uri + 'tags/list', {
      ansibleEngine: ansibleEngine,
      inventory_file_name: inventory_file_name,
      selectedPlaybook: selectedPlaybook
    }).then(successCallback, errorCallback)
  };

  // ------------- SOME HELPER FUNCTIONS --------------

  this.parseINIString = function (data) {
    var regex = {
      section: /^\s*\[\s*([^\]]*)\s*\]\s*$/,
      param: /^\s*([\w\.\-\_]+).*$/,
      comment: /^\s*;.*$/
    };

    var hosts = [];
    var groups = [];
    var lines = data.split(/\r\n|\r|\n/);
    var group = null;

    group = {'name': 'Un grouped', 'members': [], 'type': 'default'};
    groups.push(group);

    // groups.push({'name':'All Hosts', 'members': hosts, 'type': 'default'});

    lines.forEach(function (line) {
      if (regex.comment.test(line)) {
        return;
      } else if (regex.param.test(line)) {
        var match = line.match(regex.param);
        var host = match[1];
        if (hosts.indexOf(host) < 0) {
          hosts.push(host);
        }

        if (group && group.members.indexOf(host) < 0) {
          group.members.push(host);
        }

      } else if (regex.section.test(line)) {
        var match = line.match(regex.section);
        group = {'name': match[1], 'members': [], 'type': 'userdefined'};
        groups.push(group);
      }
    });
    return {'hosts': hosts, 'groups': groups};
  };


  this.jsonToAnsibleInventoryIni = function (inventoryData) {

    var name = inventoryData.name;
    var hosts = inventoryData.hosts;
    var groups = inventoryData.groups;

    var result_lines = ['# Inventory File - ' + name, ''];

    angular.forEach(groups, function (group) {
      if (group.name == 'All Hosts')return;

      if (group.name !== 'Un grouped') {
        result_lines.push('');
        result_lines.push('[' + group.name + ']');
      }

      angular.forEach(group.members, function (member) {
        result_lines.push(member);
      })

    });

    return result_lines.join('\n')

  }
}

export default angular.module('webAppApp.ansible', [])
  .service('ansible', ansibleService)
  .name;
