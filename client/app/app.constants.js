'use strict';

import angular from 'angular';

export default angular.module('app2App.constants', [])
  .constant('appConfig', require('../../server/config/environment/shared'))
  .name;
