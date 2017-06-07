'use strict';

export default function($stateProvider) {
  'ngInject';
  $stateProvider
    .state('project', {
      url: '/project',
      template: '<project></project>'
    });
}
