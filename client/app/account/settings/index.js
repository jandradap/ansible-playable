'use strict';

import angular from 'angular';
import SettingsController from './settings.controller';

export default angular.module('app2App.settings', [])
  .controller('SettingsController', SettingsController)
  .name;
