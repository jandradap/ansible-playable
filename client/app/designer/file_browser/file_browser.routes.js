'use strict';

export default function($stateProvider) {
  'ngInject';
  $stateProvider
    .state('designer.file_browser', {
      url: '/file_browser',
      template: '<file-browser></file-browser>'
    });
}
