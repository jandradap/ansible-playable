'use strict';
const angular = require('angular');

/*@ngInject*/
export function newModuleController($scope,$filter,customModules,ansible,YAML) {

  var newModuleCtrl = this;
  // List of options types for module parameters to be displayed in UI
  newModuleCtrl.optionTypes = ['str','list','dict','bool','int','float','path','raw','jsonarg','json','bytes','bits'];

  var parentCtrl = $scope.$parent.customModulesCtrl;

  // Define the default module object
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


  // Load Default Template
  newModuleCtrl.loadDefaultTemplate = function(){
    newModuleCtrl.newModule = angular.copy(defaultModule);
    parentCtrl.selectedModule.module_code = "Loading Template..";

    customModules.show('template.py',function(response) {
      parentCtrl.selectedModule.module_code = response.data.split("Stream :: close")[0];
    });
  };

  // Watch for change in new module and update Documentation, parameters and examples dynamically
  $scope.$watch('newModuleCtrl.newModule',function(newValue,oldValue){
    if(!newValue)return;
    updateDocumentation(newValue);
    updateParameters(newValue);
    updateExamples(newValue);

  },true);

  /**
   * Update parameters
   *  Use regex to identify patterns in code and update parameter section dynamically
   * */
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
    parentCtrl.selectedModule.module_code = parentCtrl.selectedModule.module_code.replace(re,"$1" + parameters_definition_string + "$3");

    var supports_check_mode_string = '\n';
    if(newValue.supports_check_mode){
      supports_check_mode_string = '\n        , supports_check_mode=True\n'
    }

    var re2 = /(# <--Begin Supports Check Mode -->)([^]+)(        # <--End Supports Check Mode -->)/;
    parentCtrl.selectedModule.module_code = parentCtrl.selectedModule.module_code.replace(re2,"$1" + supports_check_mode_string + "$3");

    var re3 = /(# <--Begin Retreiving Parameters  -->\s+    )([^]+)(\s+    # <--End Retreiving Parameters  -->)/;
    parentCtrl.selectedModule.module_code = parentCtrl.selectedModule.module_code.replace(re3,"$1" + parameters_retreive_string + "$3");

  };

  /**
   * Update Documentation
   *   Update documentation section dynamically based on user input
   *
   * */
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

    newModuleCtrl.documentation_yaml = '---\n' + $filter('json2yaml')(angular.toJson(newValue)).toString().replace(/__dot__/g,".");

    //var re = /(.*DOCUMENTATION = '''\n)([^]+?)(\n'''.*)/;
    var re = /([^]+DOCUMENTATION = '''\s+)([^]+?)(\s+'''[^]+)/;
    parentCtrl.selectedModule.module_code = parentCtrl.selectedModule.module_code.replace(re,'$1' + newModuleCtrl.documentation_yaml + '$3');
  };

  var updateExamples = function(newValue){
    newValue = angular.copy(newValue);

    var moduleCopy = {

    };

    moduleCopy[newValue.module] = convertOptionsToExampleObject(newValue.options);

    newModuleCtrl.example_yaml = YAML.stringify(moduleCopy,4);

    //var re = /(.*DOCUMENTATION = '''\n)([^]+?)(\n'''.*)/;
    var re = /([^]+EXAMPLES = '''[^]+# <--  -->\s+)([^]+?)(\s+# <-- \/ -->\s+'''[^]+)/;
    parentCtrl.selectedModule.module_code = parentCtrl.selectedModule.module_code.replace(re,'$1' + newModuleCtrl.example_yaml + '$3');
  };


  /**
   * Convert Options to Object
   * */
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


  /**
   * Convert Options to Example Object
   * */
  var convertOptionsToExampleObject = function(options){

    var result = {};

    angular.forEach(options,function(option){
      if(option.name){
        result[option.name] = "value";
      }
    });

    return result

  };


  /**
   * Convert Options to Array
   * */
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
        option['choices'] = value.choices.map(function(item){return ('"' + item + '"')}).join(",");

      if(value.aliases && value.aliases.length)
        option['aliases'] = value.aliases.map(function(item){return ('"' + item + '"')}).join(",");

      result.push(option)
    });

    return result

  };

  /**
   * Save New Module
   *
   * */
  newModuleCtrl.saveNewModule = function(){
    newModuleCtrl.saving = true;

    customModules.save(newModuleCtrl.newModule.module + '.py',parentCtrl.selectedModule.module_code,function(response){
      newModuleCtrl.saving = false;
      parentCtrl.getCustomModules();

      ansible.getAnsibleModules(function(response){

      }, function(response){

      },null,true);
      newModuleCtrl.cancelNewModule();
    },function(response){
      newModuleCtrl.saving = false;
      console.error(response.data)
    })
  };


  /**
   * Cancel New Module
   *
   * */
  newModuleCtrl.cancelNewModule = function(){
    parentCtrl.showNewModuleForm.value = false;
    parentCtrl.showModuleCode(parentCtrl.selectedModule.module.name)
  };



  /**
   * Get properties from code to display in UI
   *
   * */
  var getPropertiesFromCode = function(module_code){

    //var re = /([^]+DOCUMENTATION = '''\n)([^]+?)(\n'''[^]+)/;
    var re = /([^]+DOCUMENTATION = '''\s+)([^]+?)(\s+'''[^]+)/;
    var module_string = parentCtrl.selectedModule.module_code.replace(re,'$2');

    newModuleCtrl.newModule = YAML.parse(module_string);
    newModuleCtrl.newModule.options = convertOptionsToArrays(newModuleCtrl.newModule.options);

    if(newModuleCtrl.newModule.description && newModuleCtrl.newModule.description.length)
      newModuleCtrl.newModule.description = newModuleCtrl.newModule.description.join(";");

    if(newModuleCtrl.newModule.notes && newModuleCtrl.newModule.notes.length)
      newModuleCtrl.newModule.notes = newModuleCtrl.newModule.notes.join(";");

    if(newModuleCtrl.newModule.requirements && newModuleCtrl.newModule.requirements.length)
      newModuleCtrl.newModule.requirements = newModuleCtrl.newModule.requirements.join(";");


    re = /([^]+# <--Begin Parameter Definition -->\s+            )([^]+)(\s+            # <--END Parameter Definition -->[^]+)/;
    var parameter_string = parentCtrl.selectedModule.module_code.replace(re,"$2");

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
        angular.forEach(newModuleCtrl.newModule.options,function(option){
          if(option.name === m[1]){
            option.type = m[2].replace(/'/g,'')
          }
        })
      }

    }


  };

  $scope.$on('editModule', function(e) {
    getPropertiesFromCode(newModuleCtrl.selected_module_code)
  });

  $scope.$on('newModule', function(e) {
    newModuleCtrl.loadDefaultTemplate();
  });
}

export default angular.module('webAppApp.new_module', [])
  .controller('NewModuleController', newModuleController)
  .name;
