'use strict';
const angular = require('angular');

/*@ngInject*/
export function newPlayController($scope, $uibModalInstance, ansible, plays, selectedPlayIndex) {
  $scope.loading_msg = '';
  $scope.title = "Create Play";
  $scope.editMode = false;
  $scope.editHostMode = false;

  var selectedPlay;
  if(selectedPlayIndex > -1){
    selectedPlay = plays[selectedPlayIndex];
    $scope.title = "Edit Play";
    $scope.editMode = true;
    if(selectedPlay && selectedPlay.tags)$scope.tags = selectedPlay.tags.join(',');
  }

  $scope.newPlay = selectedPlay || {};

  $scope.newPlay_roles = $scope.newPlay.roles;

  $scope.createPlayLoading = false;

  $scope.createPlay = function () {
    $scope.ok($scope.newPlay)
  };

  $scope.ok = function (newPlay) {
    if($scope.tags)
      newPlay.tags = $scope.tags.split(',');


    if($scope.newPlay_roles && $scope.newPlay_roles.length){
      var roles = [];
      angular.forEach($scope.newPlay_roles,function(role){
        roles.push(role.text)
      });
      newPlay.roles = roles;
    }else if(newPlay.roles){
      delete newPlay.roles;
    }

    $uibModalInstance.close(newPlay);
  };

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };


  $scope.getHostsFromInventory = function(){

    var hosts = [];

    angular.forEach($scope.inventory_data_json.hosts, function(host){
      hosts.push({name:host})
    });

    angular.forEach($scope.inventory_data_json.groups, function(group){
      if(group.name !== 'Un grouped')
        hosts.push({name:group.name})
    });

    return hosts;
  };

  $scope.listOfInventoryFiles = function(){
    $scope.loading_msg = 'Loading Inventory Files';
    ansible.getInventoryList(function(response){
        $scope.loading_msg = '';
        $scope.inventoryFiles = response.data;
      },
      function(response){
        $scope.loading_msg = '';
        $scope.err_msg = response.data
      })
  };


  $scope.listOfRoles = function(){
    $scope.loading_msg = 'Loading Roles';
    ansible.getRoleList(function(response){
        $scope.loading_msg = '';
        $scope.roleList = response.data;
      },
      function(response){
        $scope.loading_msg = '';
        $scope.err_msg = response.data
      })
  };

  $scope.inventorySelected = function(selectedInventoryFile){
    $scope.loading_msg = 'Loading Hosts';
    ansible.readInventory(selectedInventoryFile,
      function(response){
        $scope.loading_msg = '';
        $scope.inventory_data_json = ansible.parseINIString(response.data);
        $scope.hosts = $scope.getHostsFromInventory();

      },function(response){
        $scope.loading_msg = '';
        $scope.err_msg = response.data
      })
  };

  $scope.getHostObject = function(hostname){
    var result = $scope.hosts.filter(function(host){
      return host.name == hostname
    });

    if(result.length){
      return result[0]
    }

  };

  $scope.listOfInventoryFiles();
  $scope.listOfRoles();

  $scope.loadTags = function(query){
    if($scope.roleList){
      var tempList = $scope.roleList.filter(function(role){
        return role.indexOf(query) > -1
      });

      return tempList
    }
  }
}

export default angular.module('webAppApp.new_play', [])
  .controller('NewPlayController', newPlayController)
  .name;
