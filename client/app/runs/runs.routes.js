'use strict';

export default function($stateProvider) {
  'ngInject';
  $stateProvider
    .state('runs', {
      url: '/runs',
      template: '<runs></runs>'
    });
}
