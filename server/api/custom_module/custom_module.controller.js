/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/custom_modules              ->  index
 * POST    /api/custom_modules              ->  create
 * GET     /api/custom_modules/:id          ->  show
 * PUT     /api/custom_modules/:id          ->  upsert
 * PATCH   /api/custom_modules/:id          ->  patch
 * DELETE  /api/custom_modules/:id          ->  destroy
 */

'use strict';

import jsonpatch from 'fast-json-patch';
import CustomModule from './custom_module.model';
var ssh2_exec = require('../../components/ssh/ssh2_exec');
var scp2_exec = require('../../components/scp/scp_exec');

function respondWithResult(res, statusCode) {
  statusCode = statusCode || 200;
  return function(entity) {
    if(entity) {
      return res.status(statusCode).json(entity);
    }
    return null;
  };
}

function patchUpdates(patches) {
  return function(entity) {
    try {
      // eslint-disable-next-line prefer-reflect
      jsonpatch.apply(entity, patches, /*validate*/ true);
    } catch(err) {
      return Promise.reject(err);
    }

    return entity.save();
  };
}

function removeEntity(res) {
  return function(entity) {
    if(entity) {
      return entity.remove()
        .then(() => {
          res.status(204).end();
        });
    }
  };
}

function handleEntityNotFound(res) {
  return function(entity) {
    if(!entity) {
      res.status(404).end();
      return null;
    }
    return entity;
  };
}

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function(err) {
    res.status(statusCode).send(err);
  };
}

// Gets a list of CustomModules
export function index(req, res) {

  var ansibleEngine = req.body.ansibleEngine;

  if(!ansibleEngine.customModules){
    return res.status(500).send("Custom Modules Folder not defined in Ansible Engine")
  }

  var command = 'ls "' + ansibleEngine.customModules + '"';

  ssh2_exec.executeCommand(command,
    null,
    function(data){
      res.send(data)
    },
    function(data){
      res.status(500).send(data)
    },
    ansibleEngine
  );

  /*return CustomModule.find().exec()
   .then(respondWithResult(res))
   .catch(handleError(res));*/
}

// Gets a single CustomModule from the DB
export function show(req, res) {
  console.log("Show " + req.params.custom_module);
  var ansibleEngine = req.body.ansibleEngine;

  if(!ansibleEngine.customModules){
    res.status(500).send("Custom Modules Folder not defined in Ansible Engine")
  }

  var command = 'cat "' + ansibleEngine.customModules + '"/' + req.params.custom_module;

  if(req.params.custom_module === 'template.py'){
    command = 'cat ' + '/opt/ehc-builder-scripts/ansible_modules/template.py';
  }


  ssh2_exec.executeCommand(command,
    null,
    function(data){
      res.send(data);
    },
    function(data){
      res.status(500).send(data)
    },
    ansibleEngine
  );

  /*return CustomModule.findById(req.params.custom_module).exec()
   .then(handleEntityNotFound(res))
   .then(respondWithResult(res))
   .catch(handleError(res));*/
}

// Test Module
export function testModule(req, res) {

  var ansibleEngine = req.body.ansibleEngine;

  var moduleArgs = req.body.moduleArgs;

  if(!ansibleEngine.customModules){
    res.status(500).send("Custom Modules Folder not defined in Ansible Engine")
  }

  var command = '/opt/ansible/ansible-devel/hacking/test-module -m "' + ansibleEngine.customModules + '/' + req.params.custom_module + "\" -a '" + JSON.stringify(moduleArgs) + "'";

  console.log("Command=" + command);

  ssh2_exec.executeCommand(command,
    null,
    function(data){
      res.send(data);
    },
    function(data){
      res.status(500).send(data)
    },
    ansibleEngine
  );

  /*return CustomModule.findById(req.params.custom_module).exec()
   .then(handleEntityNotFound(res))
   .then(respondWithResult(res))
   .catch(handleError(res));*/
}

// Creates a new CustomModule in the DB
export function create(req, res) {

  console.log("Create");

  var custom_module_name =  req.params.custom_module;
  var custom_module_code =  req.body.custom_module_code;

  var ansibleEngine = req.body.ansibleEngine;

  if(!ansibleEngine.customModules){
    res.status(500).send("Custom Modules Folder not defined in Ansible Engine")
  }

  console.log("Custom module name " + "\"" + ansibleEngine.customModules + '/' + custom_module_name + "\"")

  scp2_exec.createFileOnScriptEngine(custom_module_code,ansibleEngine.customModules + '/' + custom_module_name,
    function(){
      res.send("Saved")
    },function(err){
      res.status(500).send("Failed to create file on target")
    },
    ansibleEngine
  );

  /*return CustomModule.create(req.body)
   .then(respondWithResult(res, 201))
   .catch(handleError(res));*/
}

// Upserts the given CustomModule in the DB at the specified ID
export function upsert(req, res) {
  if(req.body._id) {
    Reflect.deleteProperty(req.body, '_id');
  }
  return CustomModule.findOneAndUpdate({_id: req.params.id}, req.body, {new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true}).exec()

    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Updates an existing CustomModule in the DB
export function patch(req, res) {
  if(req.body._id) {
    Reflect.deleteProperty(req.body, '_id');
  }
  return CustomModule.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(patchUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Deletes a CustomModule from the DB
export function destroy(req, res) {
  return CustomModule.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}
