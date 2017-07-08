/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/projects              ->  index
 * POST    /api/projects              ->  create
 * GET     /api/projects/:id          ->  show
 * PUT     /api/projects/:id          ->  upsert
 * PATCH   /api/projects/:id          ->  patch
 * DELETE  /api/projects/:id          ->  destroy
 */

'use strict';

import jsonpatch from 'fast-json-patch';
import Project from './project.model';
import config from '../../config/environment';
const util = require('util');
var ansibleTool = require('../../components/ansible/ansible_tool');

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
  console.log("Entity Not Found");
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
    console.log("ERror " + err);
    res.status(statusCode).send(err);
  };
}

// Gets a list of Projects
export function index(req, res) {
  console.log("Getting projects list");

  let filter ={owner_id: req.user._id};

  if(config.userRoles.indexOf(req.user.role) >= config.userRoles.indexOf('admin')){
    console.log("User is admin");
    filter = {}
  }

  console.log("Filter =" + JSON.stringify(filter));

  return Project.find(filter).exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a single Project from the DB
export function show(req, res) {
  return Project.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}


/**
 * Create New Project
 * - If Ansible Engine information is provided use that, else consider localhost as Ansible Engine
 * - Identify/generate project and library (custom modules location)
 * - Get Ansible version and create projects folder
 * @param req
 * @param res
 */
export function create(req, res) {

  var ansibleEngine = req.body.ansibleEngine;

  req.body.owner_id = req.user._id;
  req.body.owner_name = req.user.name;

  // Set default values
  if(!ansibleEngine.ansibleHost){
    ansibleEngine = {
      ansibleHost: config.scriptEngine.host,
      ansibleHostUser: config.scriptEngine.user,
      ansibleHostPassword: config.scriptEngine.password
    };

    // Update project request body to save in db, without password
    req.body.ansibleEngine = {
      ansibleHost: config.scriptEngine.host,
      ansibleHostUser: config.scriptEngine.user
    };
  }

  // If projectFolder is not passed, create a custom project folder
  if(!ansibleEngine.projectFolder){
    let projectFolderName = util.format('%s_%s',req.user._id, req.body.name);

    ansibleEngine.projectFolder = util.format(config.paths.ansible_projects + '/test_%s', projectFolderName);
    ansibleEngine.customModules = util.format(config.paths.ansible_projects + '/test_%s/library', projectFolderName);

    // Update project request body to save in db
    req.body.ansibleEngine.projectFolder = ansibleEngine.projectFolder;
    req.body.ansibleEngine.customModules = ansibleEngine.customModules;
    req.body.ansibleEngine.projectFolderName = projectFolderName;

  }

  // Allow creating project if no host is passed. Then use the default Ansible Engine for all operations.
  // If Ansible host is passed get Ansible version and create project folder
  if(ansibleEngine.ansibleHost){
    ansibleTool.getAnsibleVersion(
      function(version){

        req.body.ansibleVersion = version;

        ansibleTool.createProjectFolder(ansibleEngine.projectFolder,
          function(){
            return Project.create(req.body)
              .then(respondWithResult(res, 201))
              .catch(handleError(res));
          },
          function(data){
            res.status(500).send(data)
          }, ansibleEngine);

        //res.write(data);
        //res.end()
      },
      function(data){
        res.status(500).send("" + data);
      },ansibleEngine
    )
  }else{
    return Project.create(req.body)
      .then(respondWithResult(res, 201))
      .catch(handleError(res));
  }

}

// Upserts the given Project in the DB at the specified ID
export function upsert(req, res) {
  if(req.body._id) {
    Reflect.deleteProperty(req.body, '_id');
  }
  return Project.findOneAndUpdate({_id: req.params.id}, req.body, {new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true}).exec()

    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Updates an existing Project in the DB
export function patch(req, res) {
  if(req.body._id) {
    Reflect.deleteProperty(req.body, '_id');
  }
  return Project.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(patchUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}



// Deletes a Project from the DB
export function destroy(req, res) {
  return Project.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(function(entity){
      if(!entity)return null;
      return ansibleTool.deleteProjectFolder(entity);
    })
    .then(removeEntity(res))
    .catch(handleError(res));
}
