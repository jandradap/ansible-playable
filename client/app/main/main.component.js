import angular from 'angular';
import uiRouter from 'angular-ui-router';
import routing from './main.routes';

export class MainController {

  /*@ngInject*/
  constructor($http, $scope, appConfig) {
    'ngInject';
    this.$http = $http;
    $scope.appVersion = appConfig.version;
  }
}

export default angular.module('app2App.main', [uiRouter])
  .config(routing)
  .component('main', {
    template: require('./main.html'),
    controller: MainController
  })
  .name;
