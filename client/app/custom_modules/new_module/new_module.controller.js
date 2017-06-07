'use strict';
const angular = require('angular');

/*@ngInject*/
export function newModuleController($scope,$filter,customModules,ansible,YAML) {

  $scope.optionTypes = ['str','list','dict','bool','int','float','path','raw','jsonarg','json','bytes','bits'];

  var defaultModule = {
    module:null,
    short_description:"",
    description:"",
    version_added:"",
    author:"",
    notes: "",
    requirements: "",
    options:[
      {
        name:"parameter1",
        description: 'Description of parameter 1',
        required: true,
        default: null,
        choices: '"choice1", "choice2"',
        aliases: '"option1", "argument1"',
        type: ""
      }
    ]
  };


  $scope.loadDefaultTemplate = function(){
    $scope.newModule = angular.copy(defaultModule);
    $scope.selectedModule.module_code = "Loading Template..";

    customModules.show('template.py',function(response) {
      $scope.selectedModule.module_code = response.data.split("Stream :: close")[0];
    });
  };

  $scope.$watch('newModule',function(newValue,oldValue){

    updateDocumentation(newValue);
    updateParameters(newValue);
    updateExamples(newValue);

  },true);

  var updateParameters = function(newValue){
    newValue = angular.copy(newValue);

    var parameters_definition_lines = [];
    var parameters_retreive_lines = [];
    angular.forEach(newValue.options,function(option){
      if(option.name) {
        var line = option.name + "=dict(";

        var line_arguments = [];
        if (option.required)line_arguments.push("required=True");
        if (!option.required && option.default)line_arguments.push("default='" + option.default + "'");
        if (option.type)line_arguments.push("type='" + option.type + "'");
        if (option.choices)line_arguments.push("choices=[" + option.choices + "]");
        if (option.aliases)line_arguments.push("aliases=[" + option.aliases + "]");

        line += line_arguments.join(",");
        line += ")";

        parameters_definition_lines.push(line);
        parameters_retreive_lines.push(option.name + ' = module.params[\'' + option.name + '\']')
      }
    });

    var parameters_definition_string = parameters_definition_lines.join(",\n            ");
    var parameters_retreive_string = parameters_retreive_lines.join("\n    ");

    var re = /(# <--Begin Parameter Definition -->\s+            )([^]+)(\s+            # <--END Parameter Definition -->)/;
    $scope.selectedModule.module_code = $scope.selectedModule.module_code.replace(re,"$1" + parameters_definition_string + "$3");

    var supports_check_mode_string = '\n';
    if(newValue.supports_check_mode){
      supports_check_mode_string = '\n        supports_check_mode=True\n'
    }

    var re2 = /(# <--Begin Supports Check Mode -->)([^]+)(        # <--End Supports Check Mode -->)/;
    $scope.selectedModule.module_code = $scope.selectedModule.module_code.replace(re2,"$1" + supports_check_mode_string + "$3");

    var re3 = /(# <--Begin Retreiving Parameters  -->\s+    )([^]+)(\s+    # <--End Retreiving Parameters  -->)/;
    $scope.selectedModule.module_code = $scope.selectedModule.module_code.replace(re3,"$1" + parameters_retreive_string + "$3");

  };

  var updateDocumentation = function(newValue){
    newValue = angular.copy(newValue);
    newValue.options = convertOptionsToObject(newValue.options);

    delete newValue['supports_check_mode'];

    if(newValue.description)
      newValue.description = newValue.description.split(";");

    if(newValue.notes)
      newValue.notes = newValue.notes.split(";");

    if(newValue.requirements)
      newValue.requirements = newValue.requirements.split(";");

    $scope.documentation_yaml = '---\n' + $filter('json2yaml')(angular.toJson(newValue)).toString().replace(/__dot__/g,".");

    //var re = /(.*DOCUMENTATION = '''\n)([^]+?)(\n'''.*)/;
    var re = /([^]+DOCUMENTATION = '''\s+)([^]+?)(\s+'''[^]+)/;
    $scope.selectedModule.module_code = $scope.selectedModule.module_code.replace(re,'$1' + $scope.documentation_yaml + '$3');
  };

  var updateExamples = function(newValue){
    newValue = angular.copy(newValue);

    var moduleCopy = {

    };

    moduleCopy[newValue.module] = convertOptionsToExampleObject(newValue.options);

    $scope.example_yaml = YAML.stringify(moduleCopy,4);

    //var re = /(.*DOCUMENTATION = '''\n)([^]+?)(\n'''.*)/;
    var re = /([^]+EXAMPLES = '''[^]+# <--  -->\s+)([^]+?)(\s+# <-- \/ -->\s+'''[^]+)/;
    $scope.selectedModule.module_code = $scope.selectedModule.module_code.replace(re,'$1' + $scope.example_yaml + '$3');
  };

  var convertOptionsToObject = function(options){

    var result = {};

    angular.forEach(options,function(option){
      if(option.name){
        result[option.name] = {
          description: option.description
        };

        if(option.required)
          result[option.name]['required'] = "True";
        else
          delete result[option.name]['required'];

        if(!option.required && option.default)
          result[option.name]['default'] = option.default;

        if(option.choices){
          result[option.name]['choices'] = "[" + option.choices + "]"
        }

        if(option.aliases){
          result[option.name]['aliases'] = "[" + option.aliases + "]"
        }
      }

    });

    return result

  };

  var convertOptionsToExampleObject = function(options){

    var result = {};

    angular.forEach(options,function(option){
      if(option.name){
        result[option.name] = "value";
      }
    });

    return result

  };

  var convertOptionsToArrays = function(options){

    var result = [];

    angular.forEach(options,function(value,key){
      var option = {
        name: key,
        description: value.description,
        required: value.required,
        default:value.default
      };

      if(value.choices && value.choices.length)
        option['choices'] = value.choices.map(function(item){return ('"' + item + '"')}).join(",")

      if(value.aliases && value.aliases.length)
        option['aliases'] = value.aliases.map(function(item){return ('"' + item + '"')}).join(",")

      result.push(option)
    });

    return result

  };

  $scope.saveNewModule = function(){
    $scope.saving = true;
    customModules.save($scope.newModule.module + '.py',$scope.selectedModule.module_code,function(response){
      $scope.saving = false;
      $scope.getCustomModules();

      ansible.getAnsibleModules(function(response){

      }, function(response){

      },null,true);
      $scope.cancelNewModule();
    },function(response){
      $scope.saving = false;
      console.error(response.data)
    })
  };

  $scope.cancelNewModule = function(){
    $scope.showNewModuleForm.value = false;
    $scope.$parent.showModuleCode($scope.selectedModule.module.name)
  };

  var getPropertiesFromCode = function(module_code){

    //var re = /([^]+DOCUMENTATION = '''\n)([^]+?)(\n'''[^]+)/;
    var re = /([^]+DOCUMENTATION = '''\s+)([^]+?)(\s+'''[^]+)/;
    var module_string = $scope.selectedModule.module_code.replace(re,'$2');

    $scope.newModule = YAML.parse(module_string);
    $scope.newModule.options = convertOptionsToArrays($scope.newModule.options);

    if($scope.newModule.description && $scope.newModule.description.length)
      $scope.newModule.description = $scope.newModule.description.join(";");

    if($scope.newModule.notes && $scope.newModule.notes.length)
      $scope.newModule.notes = $scope.newModule.notes.join(";");

    if($scope.newModule.requirements && $scope.newModule.requirements.length)
      $scope.newModule.requirements = $scope.newModule.requirements.join(";");


    re = /([^]+# <--Begin Parameter Definition -->\s+            )([^]+)(\s+            # <--END Parameter Definition -->[^]+)/;
    var parameter_string = $scope.selectedModule.module_code.replace(re,"$2");

    // Read property type form parameter definition
    re = /\s+(.*?)=.*type=(.*?)[,\)].*/g;
    var m;

    while ((m = re.exec(parameter_string)) !== null) {
      if (m.index === re.lastIndex) {
        re.lastIndex++;
      }
      // View your result using the m-variable.
      // eg m[0] etc.
      if(m[1]){
        angular.forEach($scope.newModule.options,function(option){
          if(option.name === m[1]){
            option.type = m[2].replace(/'/g,'')
          }
        })
      }

    }


  };

  $scope.$on('editModule', function(e) {
    getPropertiesFromCode($scope.selected_module_code)
  });

  $scope.$on('newModule', function(e) {
    $scope.loadDefaultTemplate();
  });
}

export default angular.module('webAppApp.new_module', [])
  .controller('NewModuleController', newModuleController)
  .name;
