'use strict';
const angular = require('angular');

/*@ngInject*/
export function projectsService($resource) {
	// AngularJS will instantiate a singleton by calling "new" on this function
  this.resource = $resource('/api/projects/:id', {
    id: '@_id'
  },{
    update: {
      method: 'PUT' // this method issues a PUT request
    }});

    this.selectedProject = null;
    this.selectedInventoryFileName = null
}

export default angular.module('webAppApp.projects', [])
  .service('Projects', projectsService)
  .name;
