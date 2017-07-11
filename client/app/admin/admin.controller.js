'use strict';

export default class AdminController {
  /*@ngInject*/
  constructor($scope, $sce, User, system, ansi2html) {
    'ngInject';
    const admin_ctrl = this;

    // Use the User $resource to fetch all users
    this.users = User.query();

    /**
     * Fetch Server Logs
     */
    this.fetchServerLogs = function(){
      system.getLogs('server', (response) => {
        admin_ctrl.logsServer = $scope.result = $sce.trustAsHtml(ansi2html.toHtml(response.data).replace(/\n/g, "<br>"));
      }, (response) => {
        admin_ctrl.logsServer = $scope.result = $sce.trustAsHtml(ansi2html.toHtml(response.data).replace(/\n/g, "<br>"));
      });
    };


    /**
     * Fetch API Logs
     */
    this.fetchAPILogs = function(){
      system.getLogs('api', (response) => {
        admin_ctrl.logsAPI = $scope.result = $sce.trustAsHtml(ansi2html.toHtml(response.data).replace(/\n/g, "<br>"));
      }, (response) => {
        admin_ctrl.logsAPI = $scope.result = $sce.trustAsHtml(ansi2html.toHtml(response.data).replace(/\n/g, "<br>"));
      })
    }

  }

  delete(user) {
    user.$remove();
    this.users.splice(this.users.indexOf(user), 1);
  }
}
