'use strict';
const angular = require('angular');

/*@ngInject*/
export function complexVarController($scope,$filter) {
  'ngInject';
  var loadMembers = function(){
    $scope.membersCopy = angular.copy($scope.members);
    //var membersArray = $filter('addDotInKey')($filter('dictToKeyValueArray')($scope.membersCopy));
    var membersArray = ($filter('dictToKeyValueArraySimple')($scope.membersCopy));

    $scope.tabgroup = $scope.tabgroup || 0;

    if(membersArray.length)
      $scope.membersCopy = membersArray;
    else
      $scope.membersCopy = [{key:"",value:""}];

    $scope.path = $scope.path || "";

    angular.forEach($scope.membersCopy,function(member){
      if(Object.prototype.toString.call(member.value) === '[object Object]'){
        member.type = 'object';
      }else if(Object.prototype.toString.call(member.value) === '[object Array]'){
        member.type = 'array';
      }

    })

  };

  loadMembers();

  $scope.setMemberType = function(member,type){
    if(type === 'object'){
      member.value = {};
      member.type = 'object';
    }else if(type === 'array'){
      member.value = {};
      member.type = 'array';
    }
  };

  $scope.$on('membersUpdated',function(){
    console.log('On Members Updated');
    console.log($scope.members);
    loadMembers();
  });

  $scope.$watch('membersCopy',function(){
    if($scope.type === 'object')
      $scope.members = $filter('removeDotInKey')($filter('keyValueArrayToDict')($scope.membersCopy));
    else if($scope.type === 'array')
      $scope.members = $filter('keyValueArrayToArray')($scope.membersCopy);
  },true)
}

export default angular.module('webAppApp.complexVarCtrl', [])
  .controller('ComplexVarController', complexVarController)
  .name;
