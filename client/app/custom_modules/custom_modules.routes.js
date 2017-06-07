'use strict';

export default function($stateProvider) {
  'ngInject';
  $stateProvider
    .state('custom_modules', {
      url: '/custom_modules',
      template: '<custom-modules></custom-modules>'
    });
}
