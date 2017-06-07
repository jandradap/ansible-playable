'use strict';

export default function($stateProvider) {
  'ngInject';
  $stateProvider
    .state('designer', {
      url: '/designer',
      template: '<designer></designer>'
    });
}
