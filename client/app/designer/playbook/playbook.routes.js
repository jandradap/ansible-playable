'use strict';

export default function($stateProvider) {
  'ngInject';
  $stateProvider
    .state('designer.playbook', {
      url: '/playbook',
      template: '<playbook></playbook>'
    });
}
