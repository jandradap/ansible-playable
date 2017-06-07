'use strict';
const angular = require('angular');

/*@ngInject*/
export function yamlFileService(YAML) {
	// AngularJS will instantiate a singleton by calling "new" on this function
  this.jsonToYamlFile = function(jsonData, fileDescription){

    var yamlFilePrefix = '';

    yamlFilePrefix += '---\n';

    if(fileDescription)
      yamlFilePrefix += '# ' + fileDescription + '\n';

    var yamlData = yamlFilePrefix + YAML.stringify(JSON.parse(angular.toJson(jsonData)),100);

    return yamlData
  }
}

export default angular.module('webAppApp.yamlFile', [])
  .service('yamlFile', yamlFileService)
  .name;
