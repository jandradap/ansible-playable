'use strict';
const angular = require('angular');

const uiRouter = require('angular-ui-router');

import routes from './inventory.routes';


export class InventoryComponent {
  /*@ngInject*/
  constructor($scope, $uibModal, ansible) {

    'ngInject';
    $scope.selectedInventory = {inventory: "", content: ""};

    $scope.editInventory = {value: false};
    $scope.selectedGroup = {group: null};
    $scope.selectedHost = {host: null};

    $scope.complexVar = {};

    $scope.$on('projectLoaded', function () {
      $scope.getInventorys()
    });

    //To fix a warning message in console
    $scope.aceLoaded = function(_editor){
      _editor.$blockScrolling = Infinity;
    };

    // --------------------------------------- PLAYBOOKS ----------------

    $scope.getInventorys = function () {
      ansible.getInventoryList(
        function (response) {
          $scope.inventorys = response.data;
        },
        function (response) {
          console.log(response.data)
        }
      )
    };


    if ($scope.$parent.selectedProject && $scope.$parent.selectedProject.ansibleEngine) {
      $scope.getInventorys()
    }

    $scope.loadingModuleCode = false;

    $scope.showInventoryCode = function (inventory_name) {
      $scope.loadingModuleCode = true;
      if (!inventory_name) {
        $scope.selectedInventory.content = "Select a module";
        return;
      }
      ansible.readInventory(inventory_name, function (response) {
        $scope.loadingModuleCode = false;
        $scope.selectedInventory.content = response.data.split("Stream :: close")[0];

        $scope.inventory_data_json = ansible.parseINIString($scope.selectedInventory.content);
        $scope.inventory_data_json['name'] = inventory_name

      });
    };

    $scope.$watch('selectedInventory.inventory', function (newValue, oldValue) {
      if (newValue && newValue !== oldValue) {
        $scope.selectedInventory.content = "Loading Code...";
        $scope.showInventoryCode(newValue)
      }
    });


    $scope.showCreatInventoryModal = function () {
      var modalInstance = $uibModal.open({
        animation: true,
        /*templateUrl: 'createTaskContent.html',*/
        templateUrl: 'app/designer/inventory/new_inventory/new_inventory.html',
        controller: 'NewInventoryController',
        size: 'md',
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
        $scope.getInventorys();
      }, function () {

      });

    };

    $scope.editGroup = function (group) {
      $scope.showCreateGroupModal(group);
    };

    $scope.showCreateGroupModal = function (editGroup) {
      var modalInstance = $uibModal.open({
        animation: true,
        /*templateUrl: 'createTaskContent.html',*/
        templateUrl: 'app/designer/inventory/new_group/new_group.html',
        controller: 'NewGroupController',
        size: 'lg',
        backdrop: 'static',
        keyboard: false,
        closeByEscape: false,
        closeByDocument: false,
        resolve: {
          selectedProject: function () {
            return $scope.$parent.selectedProject
          },

          editGroup: function () {
            return editGroup
          }
        }
      });

      modalInstance.result.then(function (group) {
        if(!editGroup)$scope.addGroup(group);
        else $scope.selectedInventory.content = ansible.jsonToAnsibleInventoryIni($scope.inventory_data_json);

        $scope.saveInventory();
      }, function () {

      });

    };

    $scope.editHost = function (host) {

      var hostMemberOfGroups = getHostMemberOfGroups(host);

      $scope.showCreateHostModal({name: host, members: hostMemberOfGroups.join(',')});
    };

    $scope.showCreateHostModal = function (editHost) {
      var modalInstance = $uibModal.open({
        animation: true,
        /*templateUrl: 'createTaskContent.html',*/
        templateUrl: 'app/designer/inventory/new_host/new_host.html',
        controller: 'NewHostController',
        size: 'lg',
        backdrop: 'static',
        keyboard: false,
        closeByEscape: false,
        closeByDocument: false,
        resolve: {
          selectedProject: function () {
            return $scope.$parent.selectedProject
          },
          editHost: function () {
            return editHost
          }
        }
      });

      modalInstance.result.then(function (host) {
        $scope.addHost(host);
        $scope.saveInventory();
      }, function () {

      });
    };

    $scope.saveInventory = function () {
      $scope.saveInventoryLoading = true;
      ansible.createInventory($scope.selectedInventory.inventory, $scope.selectedInventory.content,
        function (response) {
          $scope.saveInventoryLoading = false;
          $scope.editInventory.value = false;
        },
        function (response) {
          $scope.saveInventoryLoading = false;
          $scope.err_msg = response.data;
        })
    };

    $scope.deleteInventory = function () {
      $scope.deleteInventoryLoading = true;
      ansible.deleteInventory($scope.selectedInventory.inventory,
        function (response) {
          $scope.deleteInventoryLoading = false;
          $scope.selectedInventory.inventory = "";
          $scope.getInventorys();
        },
        function (response) {
          $scope.deleteInventoryLoading = false;
          $scope.err_msg = response.data;
        })
    };

    $scope.addGroup = function (group) {

      $scope.inventory_data_json.groups.push(group);
      $scope.selectedInventory.content = ansible.jsonToAnsibleInventoryIni($scope.inventory_data_json);
      // To refresh All Hosts list
      $scope.inventory_data_json = ansible.parseINIString($scope.selectedInventory.content)
    };

    $scope.addHost = function (host) {
      if ($scope.inventory_data_json.hosts.indexOf(host.name) < 0)
        $scope.inventory_data_json.hosts.push(host.name);

      var host_member_of_groups = host.members.split(',');

      angular.forEach($scope.inventory_data_json.groups, function (group) {
        if ((host_member_of_groups.indexOf(group.name)) > -1 && group.members.indexOf(host.name) < 0) {
          group.members.push(host.name)
        }
      });

      $scope.selectedInventory.content = ansible.jsonToAnsibleInventoryIni($scope.inventory_data_json);
      // To refresh All Hosts list
      $scope.inventory_data_json = ansible.parseINIString($scope.selectedInventory.content)
    };


    $scope.deleteGroup = function (index) {
      $scope.inventory_data_json.groups.splice(index, 1);
      $scope.selectedInventory.content = ansible.jsonToAnsibleInventoryIni($scope.inventory_data_json);
      // To refresh All Hosts list
      $scope.inventory_data_json = ansible.parseINIString($scope.selectedInventory.content);

      $scope.saveInventory();

    };

    $scope.deleteHost = function (index, group) {

      var hostname = $scope.inventory_data_json.hosts[index];

      $scope.inventory_data_json.hosts.splice(index, 1);

      angular.forEach($scope.inventory_data_json.groups, function (group) {
        var memberIndex = group.members.indexOf(hostname)
        if (memberIndex > -1) {
          group.members.splice(memberIndex, 1)
        }
      });

      $scope.selectedInventory.content = ansible.jsonToAnsibleInventoryIni($scope.inventory_data_json);
      // To refresh All Hosts list
      $scope.inventory_data_json = ansible.parseINIString($scope.selectedInventory.content);

      $scope.saveInventory();
    };


    var getHostMemberOfGroups = function (host) {
      var groups = [];
      angular.forEach($scope.inventory_data_json.groups, function (group) {
        var memberIndex = group.members.indexOf(host);
        if (memberIndex > -1) {
          groups.push(group.name)
        }
      });
      return groups;
    };
  }
}

export default angular.module('webAppApp.inventory', [uiRouter])
  .config(routes)
  .component('inventory', {
    template: require('./inventory.html'),
    controller: InventoryComponent,
    controllerAs: 'inventoryCtrl'
  })
  .name;
