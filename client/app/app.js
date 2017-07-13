'use strict';

import angular from 'angular';
import ngAnimate from 'angular-animate';
import ngCookies from 'angular-cookies';
import ngResource from 'angular-resource';
import ngSanitize from 'angular-sanitize';

import uiRouter from 'angular-ui-router';
import uiBootstrap from 'angular-ui-bootstrap';
import 'angular-validation-match';

import 'angular-confirm';

import 'angular-ui-ace';

import 'yamljs/dist/yaml.min';

import 'ansi-to-html';

import 'angular-markdown-directive';

import 'ng-tags-input';

import 'angular-loading-bar';

import treecontrol from 'angular-tree-control';

import 'angular-tree-control/css/tree-control-attribute.css';
import 'angular-tree-control/css/tree-control.css';

import 'ng-tags-input/build/ng-tags-input.min.css';

import {
  routeConfig
} from './app.config';

import _Auth from '../components/auth/auth.module';
import account from './account';
import admin from './admin';
import navbar from '../components/navbar/navbar.component';
import footer from '../components/footer/footer.component';
import main from './main/main.component';
import DesignerComponent from './designer/designer.component';
import ProjectComponent from './project/project.component';
import InventoryComponent from './designer/inventory/inventory.component';
import PlaybookComponent from './designer/playbook/playbook.component';
import FileBrowserComponent from './designer/file_browser/file_browser.component';
import RolesComponent from './designer/roles/roles.component';
import RunsComponent from './runs/runs.component';
import CustomModulesComponent from './custom_modules/custom_modules.component';

import Projects from './services/projects/projects.service';
import ansible from './services/ansible/ansible.service';
import YAML from './providers/yaml/yaml.service';
import yamlFile from './services/yamlFile/yamlFile.service';
import system from './services/system/system.service';

import customModules from './custom_modules/custom_modules.service';

import ansi2html from './providers/ansi2html/ansi2html.service';

import constants from './app.constants';
import util from '../components/util/util.module';

import NewInventoryController from './designer/inventory/new_inventory/new_inventory.controller';


import NewGroupController from './designer/inventory/new_group/new_group.controller';
import NewHostController from './designer/inventory/new_host/new_host.controller';
import ComplexVarController from './directives/complexVar/complexVar.controller';
import NewPlaybookController from './designer/playbook/new_playbook/new_playbook.controller';
import ExecutionController from './designer/execution/execution.controller';
import NewPlayController from './designer/playbook/new_play/new_play.controller';
import NewTaskController from './designer/tasks/new_task/new_task.controller';

import NewFileController from './designer/roles/new_file/new_file.controller';
import NewRoleController from './designer/roles/new_role/new_role.controller';
import SearchRoleController from './designer/roles/search_role/search_role.controller';

import ComplexVarModalController from './modals/complex_var_modal/complex_var_modal.controller';
import VideoController from './modals/video/video.controller';

import NewModuleController from './custom_modules/new_module/new_module.controller';

import dictToKeyValueArray from './filters/dictToKeyValueArray/dictToKeyValueArray.filter';
import dictToKeyValueArraySimple from './filters/dictToKeyValueArraySimple/dictToKeyValueArraySimple.filter';
import keyValueArrayToDict from './filters/keyValueArrayToDict/keyValueArrayToDict.filter';
import keyValueArrayToArray from './filters/keyValueArrayToArray/keyValueArrayToArray.filter';
import addDotInKey from './filters/addDotInKey/addDotInKey.filter';
import removeDotInKey from './filters/removeDotInKey/removeDotInKey.filter';
import json2yaml from './filters/json2yaml/json2yaml.filter';

import complexVar from './directives/complexVar/complexVar.directive';
import tasks from './designer/tasks/tasks.directive';
import logo from './logo/logo.directive';

import editor from './services/editor/editor.service';

import './app.css';

angular.module('app2App', [ngCookies, ngResource, ngSanitize, uiRouter, uiBootstrap, _Auth, account,
  admin, 'validation.match', 'ui.ace', navbar, footer, main, constants, util, ansi2html, ngAnimate, 'angular-confirm',
  // Components
  DesignerComponent, ProjectComponent, InventoryComponent, PlaybookComponent, FileBrowserComponent, RolesComponent, RunsComponent, CustomModulesComponent,
  // Services
  YAML, yamlFile, Projects, ansible, ansi2html, editor, customModules, system,
  // Controllers
  NewInventoryController, NewGroupController, NewHostController, ComplexVarController, NewPlaybookController, ExecutionController, NewPlayController, NewTaskController, ComplexVarModalController,
  NewFileController, NewRoleController, SearchRoleController, NewModuleController, VideoController,
  // Filters
  dictToKeyValueArray, dictToKeyValueArraySimple, keyValueArrayToDict, keyValueArrayToArray, addDotInKey, removeDotInKey, json2yaml,
  // Directives
  complexVar, tasks, treecontrol, 'btford.markdown', 'ngTagsInput', 'angular-loading-bar', logo

])
  .config(routeConfig)
  .run(function($rootScope, $location, Auth) {
    'ngInject';
    // Redirect to login if route requires auth and you're not logged in

    $rootScope.$on('$stateChangeStart', function(event, next) {
      Auth.isLoggedIn(function(loggedIn) {
        if(next.authenticate && !loggedIn) {
          $location.path('/login');
        }
      });
    });
  });

angular.element(document)
  .ready(() => {
    angular.bootstrap(document, ['app2App'], {
      strictDi: true
    });
  });
