/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/ansible              ->  index
 * POST    /api/ansible              ->  create
 * GET     /api/ansible/:id          ->  show
 * PUT     /api/ansible/:id          ->  upsert
 * PATCH   /api/ansible/:id          ->  patch
 * DELETE  /api/ansible/:id          ->  destroy
 */

'use strict';

import jsonpatch from 'fast-json-patch';
import Ansible from './ansible.model';
import config from '../../config/environment';
var ssh2_exec = require('../../components/ssh/ssh2_exec');
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

// Creates a new Ansible in the DB
export function command(req, res) {

  var command = req.body.command;

  var ansibleEngine = req.body.ansibleEngine;

  ssh2_exec.executeCommand(command,
    null,
    function(data){
      res.send(data)
    },
    function(data){
      res.status(500).send(data);
    },
    ansibleEngine
  )
}

/**
 * List Ansible Modules
 * @param req
 * @param res
 */
export function modules(req, res) {

  var ansibleEngine = req.body.ansibleEngine;

  ansibleTool.getModules(function(data){
      res.write(data)
    },
    function(data){
      res.write(data);
      res.end()
    },
    function(data){
      res.write(data)
    },
    ansibleEngine
  );

}

// Gets a single Deploy from the DB
export function getLogs(req, res) {
  return Ansible.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(function(entity){
      console.log("Getting logs " + entity.logfile);
      ansibleTool.getLogs(entity.logfile,
        function(successData){
          return res.send(successData);
        },
        function(errorData){
          return res.status(500).send(errorData)
        }
      );
      return null;
    })
    .catch(handleError(res));
}

console.log("config.disablePlayboookExecution  =" + config.disablePlayboookExecution);

// Executes Ansible Play book in the backend
export function execute(req, res) {

  //var inventory_file_contents = req.body.inventory_file_contents;
  //var playbook_file_contents = req.body.playbook_file_contents;

  if(config.disablePlayboookExecution){
    return res.status(500).send('Playbook execution has been disabled. Set environment variable DISABLE_PLAYBOOK_EXECUTION to "false" and restart web server')
  }

  var playbook_name =  req.body.selectedPlaybook;
  var inventory_file_name = req.body.inventory_file_name;

  var tags = req.body.tags;
  var limit_to_hosts = req.body.limit_to_hosts;
  var verbose = req.body.verbose;
  var check_mode = req.body.check_mode;

  var ansibleEngine = req.body.ansibleEngine;
  var project_folder = ansibleEngine.projectFolder;

  console.log("Check_Mode=" + check_mode);

  var time = new Date().getTime();
  var logfilename = 'execution_' + time;

  var tags_joined = tags;
  if(typeof tags === 'object')tags_joined = tags.join(',');

  var limit_to_hosts_joined = limit_to_hosts;
  if(typeof limit_to_hosts === 'object')limit_to_hosts_joined = limit_to_hosts.join(',');

  var ansibleObject = {
    logfile: logfilename,
    tags: tags_joined,
    limit_to_hosts: limit_to_hosts,
    verbose: verbose,
    host: req.body.host,
    check_mode: check_mode,
    selectedPlaybook: req.body.selectedPlaybook,
    selectedPlay: req.body.selectedPlay,
    executionType: req.body.executionType,
    executionName: req.body.executionName,
    executionTime: time
  };

  var resultSent = false;

  // Execute Ansible Playbook and return immediately with a new Job (Ansible) object
  ansibleTool.executeAnsible(logfilename, project_folder, playbook_name, inventory_file_name, tags_joined, limit_to_hosts_joined, verbose,check_mode,
    function(data){
      //res.write(data)
      if(!resultSent){
        resultSent = true;
        return Ansible.create(ansibleObject)
          .then(respondWithResult(res, 201))
          .catch(handleError(res));
      }
    },
    function(data){
      //res.write(data);
      //res.end()
      if(!resultSent){
        resultSent = true;
        return Ansible.create(ansibleObject)
          .then(respondWithResult(res, 201))
          .catch(handleError(res));
      }
    },
    function(data){
      //res.write(data)
      if(!resultSent){
        resultSent = true;
        res.status(500).send(data)
      }
    },
    ansibleEngine
  );

}


/**
 * List playbook tags
 * ansible-playbook playbook.yml -i inventory --list-tags
 * @param req
 * @param res
 */
export function playbook_tags_list(req, res) {

  var playbook_name =  req.body.selectedPlaybook;
  var inventory_file_name = req.body.inventory_file_name;

  var ansibleEngine = req.body.ansibleEngine;
  var project_folder = ansibleEngine.projectFolder;

  ansibleTool.getTagList(project_folder, playbook_name, inventory_file_name,
    function(data){
      res.send(data)
    },
    function(data){
      res.status(500).send(data);
    },
    ansibleEngine
  );

}


export function playbook_create(req, res) {

  var playbook_file_contents = req.body.playbookFileContents;
  var ansibleEngine = req.body.ansibleEngine;
  var play_book_name = req.body.playbookName;
  var project_folder = ansibleEngine.projectFolder;

  play_book_name = play_book_name.replace(project_folder,'');
  console.log("Playbook name = " + play_book_name);

  var resultSent = false;
  ansibleTool.writePlaybook(project_folder,play_book_name,playbook_file_contents,
    function(data){
      //res.write(data);
      //res.end()
      console.log("data = " + data);
      if(!resultSent){
        resultSent = true;
        res.send(data)
      }
    },
    function(data){
      //res.write(data)
      console.log("data = " + data);
      if(!resultSent){
        resultSent = true;
        res.status(500).send(data)
      }
    },
    ansibleEngine
  );

}

export function playbook_delete(req, res) {

  var ansibleEngine = req.body.ansibleEngine;
  var play_book_name = req.body.playbookName;
  var project_folder = ansibleEngine.projectFolder;

  var resultSent = false;
  ansibleTool.deletePlaybook(project_folder,play_book_name,
    function(data){
      res.write(data)
    },
    function(data){
      if(!resultSent){
        resultSent = true;
        res.write(data);
        res.end();
      }
    },
    function(data){
      if(!resultSent){
        resultSent = true;
        res.status(500);
        res.write(data);
        res.end();
      }
    },
    ansibleEngine
  );

}

export function playbook_get(req, res) {

  var ansibleEngine = req.body.ansibleEngine;
  var play_book_name = req.body.playbookName;
  var project_folder = ansibleEngine.projectFolder;

  var resultSent = false;
  ansibleTool.readPlaybook(project_folder,play_book_name,
    function(data){
      res.write(data)
    },
    function(data){
      if(!resultSent){
        resultSent = true;
        res.write(data);
        res.end();
      }
    },
    function(data){
      if(!resultSent){
        resultSent = true;
        res.status(500);
        res.write(data);
        res.end();
      }
    },
    ansibleEngine
  );

}


export function playbook_list(req, res) {

  var ansibleEngine = req.body.ansibleEngine;
  var project_folder = ansibleEngine.projectFolder;

  ansibleTool.getPlaybookList(project_folder,
    function(data){
      res.send(data)
    },
    function(data){
      res.status(500).send(data);
    },
    ansibleEngine
  );

}


export function roles_list(req, res) {

  var ansibleEngine = req.body.ansibleEngine;
  var project_folder = ansibleEngine.projectFolder;

  ansibleTool.getRolesList(project_folder,
    function(data){
      res.send(data)
    },
    function(data){
      res.status(500).send(data);
    },
    ansibleEngine
  );

}

export function inventory_list(req, res) {

  var ansibleEngine = req.body.ansibleEngine;
  var project_folder = ansibleEngine.projectFolder;

  ansibleTool.getInventoryList(project_folder,
    function(data){
      res.send(data)
    },
    function(data){
      res.status(500).send(data);
    },
    ansibleEngine
  );

}

export function inventory_get(req, res) {

  var ansibleEngine = req.body.ansibleEngine;
  var project_folder = ansibleEngine.projectFolder;
  var inventoryName = req.body.inventoryName;

  ansibleTool.readInventoryFile(project_folder,inventoryName,
    function(data){
      res.send(data)
    },
    function(data){
      res.status(500).send(data);
    },
    ansibleEngine
  );

}


export function inventory_create(req, res) {

  var inventoryFileContents = req.body.inventoryFileContents;
  var ansibleEngine = req.body.ansibleEngine;
  var inventoryName = req.body.inventoryName;
  var project_folder = ansibleEngine.projectFolder;

  var file_path = project_folder + '/' + inventoryName;

  ansibleTool.writeFile(file_path,inventoryFileContents,
    function(data){
      res.send(data);
    },
    function(data){
      res.status(500).send(data)
    },
    ansibleEngine
  );

}

export function inventory_delete(req, res) {

  var ansibleEngine = req.body.ansibleEngine;
  var inventoryName = req.body.inventoryName;
  var project_folder = ansibleEngine.projectFolder;

  var file_path = project_folder + '/' + inventoryName;

  ansibleTool.deleteFile(file_path,
    function(data){
      res.send(data);
    },
    function(data){
      res.status(500).send(data)
    },
    ansibleEngine
  );

}

export function update_groups_vars_file(req, res) {

  var groupVarsContents = req.body.groupVarsContents;
  var ansibleEngine = req.body.ansibleEngine;
  var groupName = req.body.groupName;
  var project_folder = ansibleEngine.projectFolder;

  var file_path = project_folder + '/group_vars/' + groupName;

  ansibleTool.writeFile(file_path, groupVarsContents,
    function(data){
      res.send(data);
    },
    function(data){
      res.status(500).send(data)
    },
    ansibleEngine
  );

}

export function get_groups_vars_file(req, res) {

  var ansibleEngine = req.body.ansibleEngine;
  var groupName = req.body.groupName;
  var project_folder = ansibleEngine.projectFolder;

  var file_path = project_folder + '/group_vars/' + groupName;

  ansibleTool.readFile(file_path,
    null,
    function(data){
      res.send(data);
    },
    function(data){
      res.status(500).send(data)
    },
    ansibleEngine
  );

}


export function update_hosts_vars_file(req, res) {

  var hostVarsContents = req.body.hostVarsContents;
  var ansibleEngine = req.body.ansibleEngine;
  var hostName = req.body.hostName;
  var project_folder = ansibleEngine.projectFolder;

  var file_path = project_folder + '/host_vars/' + hostName;

  ansibleTool.writeFile(file_path, hostVarsContents,
    function(data){
      res.send(data);
    },
    function(data){
      res.status(500).send(data)
    },
    ansibleEngine
  );

}

export function get_hosts_vars_file(req, res) {

  var ansibleEngine = req.body.ansibleEngine;
  var hostName = req.body.hostName;
  var project_folder = ansibleEngine.projectFolder;

  var file_path = project_folder + '/host_vars/' + hostName;

  ansibleTool.readFile(file_path,
    null,
    function(data){
      res.send(data);
    },
    function(data){
      res.status(500).send(data)
    },
    ansibleEngine
  );

}


/**
 * Get variables for a host using Python AnsibleAPI
 * @param req
 * @param res
 */
export function get_hosts_vars(req,res){

  var ansibleEngine = req.body.ansibleEngine;
  var host_name = req.body.hostName;
  var project_folder = ansibleEngine.projectFolder;
  var inventory_file_name = req.body.inventoryFileName;

  console.log('hostName=' + host_name)

  ansibleTool.getVars(project_folder,inventory_file_name,host_name,
    null,
    function(data){
      res.send(data);
    },
    function(data){
      res.status(500).send(data)
    },
    ansibleEngine)

}


/**
 * Get variables for a role using Python AnsibleAPI
 * @param req
 * @param res
 */
export function get_roles_vars(req,res){

  var ansibleEngine = req.body.ansibleEngine;
  var role_name = req.body.roleName;
  var project_folder = ansibleEngine.projectFolder;

  console.log('roleName=' + role_name);

  ansibleTool.getRolesVars(project_folder,role_name,
    null,
    function(data){
      res.send(data);
    },
    function(data){
      res.status(500).send(data)

    },
    ansibleEngine)

}

export function roles_search_galaxy(req, res) {

  var ansibleEngine = req.body.ansibleEngine;
  var searchText = req.body.searchText;

  ansibleTool.searchRolesGalaxy(searchText,
    function(data){
      res.send(data)
    },
    function(data){
      res.status(500).send(data);
    },
    ansibleEngine
  );

}

export function roles_search_github(req, res) {

  var ansibleEngine = req.body.ansibleEngine;
  var searchText = req.body.searchText;

  ansibleTool.searchRolesGithub(searchText,
    function(data){
      res.send(data)
    },
    function(data){
      res.status(500).send(data);
    },
    ansibleEngine
  );

}

/**
 * Create/Copy Role
 * Create a new role if selectedRoleName is null
 * Copy existing role if selectedRoleName is not null
 * @param req
 * @param res
 */
export function roles_create(req, res) {

  var ansibleEngine = req.body.ansibleEngine;
  var roleName = req.body.roleName;
  var selectedRoleName = req.body.selectedRoleName;

  var createRoleFunction = ansibleTool.createRole;

  if(selectedRoleName)
    createRoleFunction = ansibleTool.copyRole;

  createRoleFunction(roleName,
    function(data){
      res.send(data)
    },
    function(data){
      res.status(500).send(data);
    },
    ansibleEngine,
    selectedRoleName
  );

}

export function roles_import(req, res) {

  var ansibleEngine = req.body.ansibleEngine;
  var roleType = req.body.roleType;
  var roleNameUri = req.body.roleNameUri;

  ansibleTool.importRole(roleType,roleNameUri,
    function(data){
      res.send(data)
    },
    function(data){
      res.status(500).send(data);
    },
    ansibleEngine
  );

}

export function roles_delete(req, res) {

  var ansibleEngine = req.body.ansibleEngine;
  var roleName = req.body.roleName;

  ansibleTool.deleteRole(roleName,
    function(data){
      res.send(data)
    },
    function(data){
      res.status(500).send(data);
    },
    ansibleEngine
  );

}

export function roles_files(req, res) {

  var ansibleEngine = req.body.ansibleEngine;
  var roleName = req.body.roleName;

  ansibleTool.getRoleFiles(roleName,
    function(data){
      res.send(data)
    },
    function(data){
      res.status(500).send(data);
    },
    ansibleEngine
  );

}

export function project_files(req, res) {

  var ansibleEngine = req.body.ansibleEngine;

  ansibleTool.getProjectFiles(
    function(data){
      res.send(data)
    },
    function(data){
      res.status(500).send(data);
    },
    ansibleEngine
  );

}

export function file_create(req, res) {

  var ansibleEngine = req.body.ansibleEngine;
  var fileAbsolutePath = req.body.fileAbsolutePath;

  ansibleTool.createFile(fileAbsolutePath,
    function(data){
      res.send(data)
    },
    function(data){
      res.status(500).send(data);
    },
    ansibleEngine
  );

}

export function file_update(req, res) {

  var ansibleEngine = req.body.ansibleEngine;
  var fileAbsolutePath = req.body.fileAbsolutePath;
  var fileContents = req.body.fileContents;

  ansibleTool.writeFile(fileAbsolutePath,fileContents,
    function(data){
      res.send(data)
    },
    function(data){
      res.status(500).send(data);
    },
    ansibleEngine
  );

}

export function file_delete(req, res) {

  var ansibleEngine = req.body.ansibleEngine;
  var fileAbsolutePath = req.body.fileAbsolutePath;

  ansibleTool.deleteFile(fileAbsolutePath,
    function(data){
      res.send(data)
    },
    function(data){
      res.status(500).send(data);
    },
    ansibleEngine
  );

}

// Gets a list of Ansibles
export function index(req, res) {
  return Ansible.find().exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a single Ansible from the DB
export function show(req, res) {
  return Ansible.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Creates a new Ansible in the DB
export function create(req, res) {
  return Ansible.create(req.body)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

// Upserts the given Ansible in the DB at the specified ID
export function upsert(req, res) {
  if(req.body._id) {
    Reflect.deleteProperty(req.body, '_id');
  }
  return Ansible.findOneAndUpdate({_id: req.params.id}, req.body, {new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true}).exec()

    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Updates an existing Ansible in the DB
export function patch(req, res) {
  if(req.body._id) {
    Reflect.deleteProperty(req.body, '_id');
  }
  return Ansible.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(patchUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Deletes a Ansible from the DB
export function destroy(req, res) {
  return Ansible.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}
