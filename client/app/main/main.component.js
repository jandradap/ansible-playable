import angular from 'angular';
import uiRouter from 'angular-ui-router';
import routing from './main.routes';

export class MainController {

  /*@ngInject*/
  constructor($http, $scope, $uibModal, appConfig) {
    'ngInject';
    this.$http = $http;
    $scope.appVersion = appConfig.version;

    this.videos = appConfig.videos;

    this.showVideoModal = function (video) {
      var modalInstance = $uibModal.open({
        animation: true,
        template: require('../modals/video/video.html'),
        controller: 'VideoController',
        size: 'md',
        backdrop: 'static',
        keyboard: false,
        closeByEscape: false,
        closeByDocument: false,
        resolve: {
          video: function () {
            return video
          }
        }
      });

    };

  }
}

export default angular.module('app2App.main', [uiRouter])
  .config(routing)
  .component('main', {
    template: require('./main.html'),
    controller: MainController
  })
  .name;
