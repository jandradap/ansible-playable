/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/system              ->  index
 * POST    /api/system              ->  create
 * GET     /api/system/:id          ->  show
 * PUT     /api/system/:id          ->  upsert
 * PATCH   /api/system/:id          ->  patch
 * DELETE  /api/system/:id          ->  destroy
 */

'use strict';

import jsonpatch from 'fast-json-patch';
import config from '../../config/environment';

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


exports.serverLogs = function(req,res){

  const fs = require('fs');

  console.log("Server logs")

  fs.readFile(config.paths.local_server_logfile, function(err, data){
    if(err)res.status(500).send(err);
    else res.send(data);
  })

};

exports.apiLogs = function(req,res){

  const fs = require('fs');

  fs.readFile(config.paths.local_express_server_logfile, function(err, data){
    if(err)res.status(500).send(err);
    else res.send(data);
  })

};
