'use strict';
const angular = require('angular');

/*@ngInject*/
export function editorService() {
  // Service logic
  // ...

  var ui_ace_doctype_map = {
    '': 'ini',
    'txt': 'text',
    'text': 'text',
    'yml': 'yaml',
    'yaml': 'yaml',
    'json': 'json',
    'md': 'markdown',
    'html': 'html',
    'py': 'python',
    'j2': 'ini'
  };

  var setContentAndType = function (data, file, selectedFile) {
    if (typeof data == 'object') {
      selectedFile.content = JSON.stringify(data, null, '\t');
    } else {
      selectedFile.content = data;
    }

    selectedFile.docType = ui_ace_doctype_map[file.extension.replace('.', '')];
    selectedFile.showSource = true;

    if (selectedFile.docType == 'markdown') {
      selectedFile.markdownContent = selectedFile.content;
      selectedFile.showSource = false;
    }
  };

  // Public API here
  return {
    ui_ace_doctype_map: ui_ace_doctype_map,
    setContentAndType: setContentAndType
  };
}


export default angular.module('webAppApp.editor', [])
  .factory('editor', editorService)
  .name;
