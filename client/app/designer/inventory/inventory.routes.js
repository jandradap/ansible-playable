'use strict';

export default function($stateProvider) {
  'ngInject';
  $stateProvider
    .state('designer.inventory', {
      url: '/inventory',
      template: '<inventory></inventory>'
    });
}
