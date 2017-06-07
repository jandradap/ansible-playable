'use strict';

export default function($stateProvider) {
  'ngInject';
  $stateProvider
    .state('designer.roles', {
      url: '/roles',
      template: '<roles></roles>'
    });
}
