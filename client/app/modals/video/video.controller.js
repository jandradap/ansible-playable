'use strict';
const angular = require('angular');

/*@ngInject*/
export function videoController($scope, $uibModalInstance,$sce, video) {

  this.video_id = video.video_id;
  $scope.video_url = $sce.trustAsResourceUrl("https://www.youtube.com/embed/" + this.video_id);

  console.log("Video URL = " + this.video_url);

  $scope.cancel = function () {
    $uibModalInstance.close();
  };
}

export default angular.module('webAppApp.video', [])
  .controller('VideoController', videoController)
  .name;
