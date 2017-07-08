var ssh2_exec = require('../ssh/ssh2_exec');
var scp2_exec = require('../scp/scp_exec');
var config =  require('../../config/environment');
const util = require('util');
const Q = require("q");

const all_commands = require('../../config/commands');

var local_logPath = 'logs/ansible/execute/';

/**
 * Get Logs
 * @param logfilename
 * @param successCallback
 * @param errorCallback
 */
exports.getLogs = function(logfilename,successCallback,errorCallback){
  var logFile = local_logPath + logfilename;
  var fs = require('fs');
  fs.readFile(logFile, function(err, data){
    if(err){
      errorCallback(err);
    }else{
      successCallback(data);
    }

  });
};

/**
 * Get Modules including any custom modules for this project.
 * Set ANSIBLE_LIBRARY path to custom modules path for this purpose
 * @param dataCallback
 * @param successCallback
 * @param errorCallback
 * @param ansibleEngine
 */
exports.getModules = function(dataCallback, successCallback,errorCallback, ansibleEngine){

  var command = all_commands.ansible.doc;

  if(ansibleEngine.customModules){
    //command = 'export ANSIBLE_LIBRARY="' + ansibleEngine.customModules + '"; ' + command;
    command = util.format(all_commands.ansible.export_ansible_library, ansibleEngine.customModules) + command;
  }

  ssh2_exec.executeCommand(command,
    null,
    function(data){
      successCallback(data);
    },
    function(data){
      errorCallback(data)
    },
    ansibleEngine
  )
};

/**
 * Get Ansible Version from Ansible Engine
 * @param successCallback
 * @param errorCallback
 * @param ansibleEngine
 */
exports.getAnsibleVersion = function(successCallback,errorCallback, ansibleEngine){
  var command = all_commands.ansible.version;
  var ansibleVersionResult = "";

  ssh2_exec.executeCommand(command,
    null,
    function(data){
      ansibleVersionResult=data;
      console.log("Ansible Verison =" + ansibleVersionResult);
      ansibleVersionResult = "" + ansibleVersionResult;
      var version = ansibleVersionResult.replace(/ansible (.*)[^]+/,"$1");
      console.log("Version=" + version);
      successCallback(version || ansibleVersionResult);
    },
    function(data){
      errorCallback(data)
    },
    ansibleEngine
  )
};

/**
 * Get/generate Ansible Command
 * @param project_folder
 * @param playbook_name
 * @param inventory_file_name
 * @param tags_joined
 * @param limit_to_hosts_joined
 * @param verbose
 * @param check_mode
 * @param dataCallback
 * @param successCallback
 * @param errorCallback
 * @param ansibleEngine
 * @returns {string}
 */
exports.getAnsibleCommand = function(project_folder, playbook_name, inventory_file_name, tags_joined, limit_to_hosts_joined, verbose,check_mode,dataCallback, successCallback,errorCallback,ansibleEngine){
  var command = util.format(all_commands.ansible.export_force_color + all_commands.ansible.export_host_key_check + 'cd %s; ' +  all_commands.ansible.playbook , 'true', 'False', project_folder, playbook_name, inventory_file_name)

  if(ansibleEngine.customModules){
    command = 'export ANSIBLE_LIBRARY="' + ansibleEngine.customModules + '"; ' + command;
  }

  if(tags_joined)
    command += ' --tags "' + tags_joined + '"';

  if(limit_to_hosts_joined)
    command += ' --limit "' + limit_to_hosts_joined + '"';

  if(verbose === 'verbose_detail'){
    command += ' -vvv ';
  }
  else if(verbose === 'verbose'){
    command += ' -v ';
  }

  if(check_mode !== 'No_Check'){
    command += ' --check ';
  }

  console.log("Command= " + command);

  return command;
};

/**
 * Execute Ansible Playbook
 * @param logfilename
 * @param project_folder
 * @param playbook_name
 * @param inventory_file_name
 * @param tags_joined
 * @param limit_to_hosts_joined
 * @param verbose
 * @param check_mode
 * @param dataCallback
 * @param successCallback
 * @param errorCallback
 * @param ansibleEngine
 */
exports.executeAnsible = function(logfilename, project_folder, playbook_name, inventory_file_name, tags_joined, limit_to_hosts_joined, verbose,check_mode,dataCallback, successCallback,errorCallback,ansibleEngine){

  var fs = require('filendir');
  var time = new Date().getTime();
  var logFile = local_logPath + logfilename;

  fs.writeFileSync(logFile,"Executing Ansible Playbook \n\n",{'flag':'a'});
  fs.writeFileSync(logFile," Completed \n",{'flag':'a'});

  var command = exports.getAnsibleCommand(project_folder, playbook_name, inventory_file_name, tags_joined, limit_to_hosts_joined, verbose,check_mode,dataCallback, successCallback,errorCallback,ansibleEngine);

  fs.writeFile(logFile,"\n Executing Command =" + command + "\n");

  ssh2_exec.executeCommand(command,function(response){
    //Calling datacallbcak back as the call is Asynchronous
    //Logs are queried to check status
    dataCallback(response);
    console.log(response);
    //fs.writeFile(logFile,response,{'flag':'a'});
      fs.writeFile(logFile,"\n Executing Command =" + command + "\n" + response);
  },function(response){
    successCallback(response);
    console.log(response);
    //fs.writeFile(logFile,response,{'flag':'a'});
  },function(response){
    errorCallback(response);
    console.log(response);
    fs.writeFile(logFile,response,{'flag':'a'});
  },ansibleEngine, true //addScriptEndString
  )

};


/**
 * Get Vars
 * @param project_folder
 * @param inventory_file_name
 * @param host_name
 * @param dataCallback
 * @param successCallback
 * @param errorCallback
 * @param ansibleEngine
 */
exports.getVars = function(project_folder, inventory_file_name, host_name, dataCallback, successCallback,errorCallback,ansibleEngine){

  var fs = require('filendir');

  var AnsibleAPILocation = '/tmp/AnsibleAPI.py';

  var command= 'cd "' + project_folder + '";  python "' + AnsibleAPILocation + '" host_vars --inventory_file="' + inventory_file_name + '"';

  if(host_name){
    command += ' --host_name ' + host_name;
  }

  if(ansibleEngine.customModules){
    command = 'export ANSIBLE_LIBRARY="' + ansibleEngine.customModules + '"; ' + command;
  }

  console.log("Command= " + command);

  scp2_exec.copyFileToScriptEngine('./helpers/AnsibleAPI.py',AnsibleAPILocation,ansibleEngine,function(){
    ssh2_exec.executeCommand(command,null,successCallback,errorCallback,ansibleEngine);
  }, errorCallback);

};

/**
 * Get Role Vars
 * @param project_folder
 * @param role_name
 * @param dataCallback
 * @param successCallback
 * @param errorCallback
 * @param ansibleEngine
 */
exports.getRolesVars = function(project_folder, role_name, dataCallback, successCallback,errorCallback,ansibleEngine){

  var AnsibleAPILocation = '/tmp/AnsibleAPI.py';

  var project_roles_folder = project_folder + '/roles';
  var playbook_path = role_name + '/tests/test.yml';
  var command= 'cd "' + project_roles_folder + '";  python "' + AnsibleAPILocation + '" role_vars --playbook_path="' + playbook_path + '" ';

  if(ansibleEngine.customModules){
    command = 'export ANSIBLE_LIBRARY="' + ansibleEngine.customModules + '"; ' + command;
  }

  console.log("Command= " + command);

  scp2_exec.copyFileToScriptEngine('./helpers/AnsibleAPI.py',AnsibleAPILocation,ansibleEngine,function(){
    ssh2_exec.executeCommand(command,null,successCallback,errorCallback,ansibleEngine);
  }, errorCallback);


};


/**
 * Write File
 * @param file_path
 * @param file_contents
 * @param successCallback
 * @param errorCallback
 * @param ansibleEngine
 */
exports.writeFile = function(file_path,file_contents, successCallback,errorCallback,ansibleEngine){

  scp2_exec.createFileOnScriptEngine(file_contents, file_path,
    function(){
      successCallback('file written');
    },function(err){
      errorCallback(err);
    },ansibleEngine);

};

/**
 * Delete File
 * @param file_path
 * @param successCallback
 * @param errorCallback
 * @param ansibleEngine
 */
exports.deleteFile = function(file_path,successCallback,errorCallback,ansibleEngine){

  var command = 'rm -rf "' + file_path + '"';

  ssh2_exec.executeCommand(command,null,successCallback,errorCallback,ansibleEngine)

};

/**
 * Read Contents of a file
 * @param file_path
 * @param dataCallback
 * @param successCallback
 * @param errorCallback
 * @param ansibleEngine
 */
exports.readFile = function(file_path, dataCallback, successCallback,errorCallback,ansibleEngine){

  var command = 'cat "' + file_path + '"';

  ssh2_exec.executeCommand(command,null,successCallback,errorCallback,ansibleEngine)

};

/**
 * Write to a Playbook file
 * @param project_folder
 * @param playbook_file_name
 * @param playbook_file_contents
 * @param successCallback
 * @param errorCallback
 * @param ansibleEngine
 */
exports.writePlaybook = function(project_folder,playbook_file_name,playbook_file_contents, successCallback,errorCallback,ansibleEngine){

  var playbook_file_path = '' + project_folder + '/' + playbook_file_name + '';

  console.log('playbook_file_path=' + playbook_file_path);

  scp2_exec.createFileOnScriptEngine(playbook_file_contents, playbook_file_path,
    function(){
      console.log('playbook_file written');
      successCallback('playbook_file written');
    },function(err){
      errorCallback(err);
    },ansibleEngine);

};

/**
 * Read Playbook file contents
 * @param project_folder
 * @param playbook_file_name
 * @param dataCallback
 * @param successCallback
 * @param errorCallback
 * @param ansibleEngine
 */
exports.readPlaybook = function(project_folder,playbook_file_name, dataCallback, successCallback,errorCallback,ansibleEngine){

  var playbook_file_path = project_folder + '/' + playbook_file_name;
  var command = 'cat "' + playbook_file_path + '"';

  ssh2_exec.executeCommand(command,null,successCallback,errorCallback,ansibleEngine)

};

/**
 * Delete Playbook
 * @param project_folder
 * @param playbook_file_name
 * @param dataCallback
 * @param successCallback
 * @param errorCallback
 * @param ansibleEngine
 */
exports.deletePlaybook = function(project_folder,playbook_file_name, dataCallback, successCallback,errorCallback,ansibleEngine){

  var playbook_file_path = project_folder + '/' + playbook_file_name;
  var command = 'rm -f "' + playbook_file_path + '"';

  ssh2_exec.executeCommand(command,null,successCallback,errorCallback,ansibleEngine)

};

/**
 * Get Playbook List
 * @param project_folder
 * @param successCallback
 * @param errorCallback
 * @param ansibleEngine
 */
exports.getPlaybookList = function(project_folder, successCallback, errorCallback, ansibleEngine){

  var playbook_file_path = project_folder + '/';
  var command = 'ls "' + playbook_file_path + '" | grep .yml';
  var ansiblePlaybookListResults = "";

  ssh2_exec.executeCommand(command,
    null,
    function(data){
      ansiblePlaybookListResults=data;
      var files = [];
      if(ansiblePlaybookListResults)
        files = ansiblePlaybookListResults.trim().split('\n');
      successCallback(files);
    },
    function(data){
      errorCallback(data)
    },
    ansibleEngine
  )

};

/**
 * Get list of roles from project
 * @param project_folder - Project root folder
 * @param successCallback - Success Callback method
 * @param errorCallback - Error Callback method
 * @param ansibleEngine - Remote Ansible Engine details
 */
exports.getRolesList = function(project_folder, successCallback, errorCallback, ansibleEngine){

  var playbook_file_path = project_folder + '/roles';
  var command = 'ls "' + playbook_file_path + '"';
  var ansiblePlaybookListResults = "";

  ssh2_exec.executeCommand(command,
    null,
    function(data){
      ansiblePlaybookListResults=data;
      var roles = [];
      if(ansiblePlaybookListResults)
        roles = ansiblePlaybookListResults.trim().split('\n');
      successCallback(roles);
    },
    function(data){
      errorCallback(data)
    },
    ansibleEngine
  )

};


/**
 * Create Project Folder
 * @param project_folder - Project folder to create
 * @param successCallback
 * @param errorCallback
 * @param ansibleEngine - Remote Ansible Engine details
 */
exports.createProjectFolder = function(project_folder, successCallback, errorCallback, ansibleEngine){

  var librarypath = project_folder + '/library';
  var rolespath = project_folder + '/roles';
  var command = 'mkdir -p "' + librarypath + '"; mkdir -p "' + rolespath + '"';

  var check_dir_command = '[ ! -d ' + project_folder + ' ]';

  ssh2_exec.executeCommand(check_dir_command,null,function(data){
    ssh2_exec.executeCommand(command,null,successCallback,errorCallback,ansibleEngine);
  },function(){
    errorCallback("Directory - " + project_folder +" already exists. Try a different Project Folder path.")
  },ansibleEngine);

};

/**
 * Delete Project Folder
 * @param project
 */
exports.deleteProjectFolder = function(project){

  var deferred = Q.defer();

  if(!project){
    deferred.reject(new Error("Project not found "));
    return deferred.promise;
  }

  var ansibleEngine = project.ansibleEngine;
  var project_folder = ansibleEngine.projectFolder;
  var archive_folder = config.paths.ansible_projects + '/archive';

  var command = util.format('mkdir -p %s && tar -cvf %s/%s.tar %s && rm -rf %s', archive_folder, archive_folder, ansibleEngine.projectFolderName, project_folder, project_folder);

  var check_dir_command = '[ -d ' + project_folder + ' ]';

  ssh2_exec.executeCommand(check_dir_command,null,(data) => {
    ssh2_exec.executeCommand(command,null,
      (success_response) => {
        deferred.resolve(project);
    },(error_response) => {
        deferred.reject(new Error(error_response));
    },ansibleEngine);
  },() => {
    deferred.reject(new Error("Directory - " + project_folder +" does not exist."));
  },ansibleEngine);

  return deferred.promise;

};

/**
 * Search roles in ansible-galaxy
 * Use ansible-galaxy search command
 * @param searchText - Text to search
 * @param successCallback
 * @param errorCallback
 * @param ansibleEngine - Remote Ansible Engine details
 */
exports.searchRolesGalaxy = function(searchText, successCallback, errorCallback, ansibleEngine){

  var command = 'ansible-galaxy search ' + searchText;
  console.log('Command = ' + command);
  ssh2_exec.executeCommand(command,null,function(response){

    console.log("Galaxy Response =" + response);

    if(response.indexOf('No roles match your search.') > -1){
      return errorCallback('No roles match your search.')
    }else{
      var str = response.replace(/[^]+--\n([^]+)/g,'$1');

      var re = /\s+(.*?)\s+(.*)/gm;
      var m;
      var results = [];
      while ((m = re.exec(str)) !== null) {
        if (m.index === re.lastIndex) {
          re.lastIndex++;
        }
        // View your result using the m-variable.
        // eg m[0] etc.

        results.push({'name':m[1],'description':m[2],'type':'galaxy'})

      }

      successCallback(results);

    }

  }, errorCallback,ansibleEngine);

};

/**
 * Search Roles in GitHub
 * Uses uri https://api.github.com/search/repositories?q=ansible-role-<searchText>
 * @param searchText
 * @param successCallback
 * @param errorCallback
 * @param ansibleEngine
 */
exports.searchRolesGithub = function(searchText, successCallback, errorCallback, ansibleEngine){

  var https = require('https');
  var options = {
    host: 'api.github.com',
    path: '/search/repositories?q=ansible-role-' + searchText,
    headers: {'user-agent': 'node.js'}
  };

  console.log("path " + '/search/repositories?q=ansible-role' + searchText)

  var req = https.get(options, function(res) {
    console.log('STATUS: ' + res.statusCode);
    console.log('HEADERS: ' + JSON.stringify(res.headers));
    console.log('DATA: ' + JSON.stringify(res.data));

    // Buffer the body entirely for processing as a whole.
    var bodyChunks = [];
    res.on('data', function(chunk) {
      // You can process streamed parts here...
      bodyChunks.push(chunk);
    }).on('end', function() {
      var body = Buffer.concat(bodyChunks);
      console.log('BODY: ' + body);

      var json_results = JSON.parse(body);
      var results = [];
      console.log("Search Results = " + json_results.total_count);
      for(var i=0;i<json_results.total_count;i++){
        try{
          results.push({'name':json_results.items[i].name,'description':json_results.items[i].description,'url':json_results.items[i].clone_url,'type':'gitrepo'})
        }catch (e){
          console.error(e)
        }

      }

      successCallback(results);

      // ...and/or process the entire body here.
    })
  });

  req.on('error', function(e) {
    console.log('ERROR: ' + e.message);
    errorCallback(e.message)
  });

};

/**
 * Creates Ansible Role
 * Uses ansible-galaxy init to create role in projectFolder
 * @param roleName - Role name to create
 * @param successCallback
 * @param errorCallback
 * @param ansibleEngine
 */
exports.createRole = function(roleName, successCallback, errorCallback, ansibleEngine){

  var projectFolder = ansibleEngine.projectFolder;
  var command = 'cd "' + projectFolder +  '/roles"; ansible-galaxy init ' + roleName;

  ssh2_exec.executeCommand(command,null,successCallback,errorCallback,ansibleEngine);

};

/**
 * Copy an existing role
 * Uses cp -r command to copy existing folder and deletes .git directory inside it.
 * @param roleName - Name of new role name
 * @param selectedRoleName - Existing roleName
 * @param successCallback
 * @param errorCallback
 * @param ansibleEngine
 */
exports.copyRole = function(roleName, successCallback, errorCallback, ansibleEngine, selectedRoleName){
  var projectFolder = ansibleEngine.projectFolder;
  var command = 'cd "' + projectFolder +  '/roles"; cp -r "' + selectedRoleName + '" "' + roleName + '"; rm -rf "' + roleName + '/.git"';

  ssh2_exec.executeCommand(command,null,successCallback,errorCallback,ansibleEngine);
};

/**
 * Delete role folder
 * Uses rm -rf to delete
 * @param roleName - role folder name to delete
 * @param successCallback
 * @param errorCallback
 * @param ansibleEngine
 */
exports.deleteRole = function(roleName, successCallback, errorCallback, ansibleEngine){

  var projectFolder = ansibleEngine.projectFolder;
  var command = 'rm -rf "' + projectFolder +  '/roles/' + roleName + '"';

  ssh2_exec.executeCommand(command,null,successCallback,errorCallback,ansibleEngine);

};

/**
 * Import Role to project
 * - Handle both import from GIT and import from Galaxy
 * @param roleType
 * @param roleNameUri
 * @param successCallback
 * @param errorCallback
 * @param ansibleEngine
 * @returns {*}
 */
exports.importRole = function(roleType, roleNameUri, successCallback, errorCallback, ansibleEngine){

  var projectFolder = ansibleEngine.projectFolder;
  var rolesFolder = projectFolder +  '/roles';
  var command = 'cd "' + rolesFolder + '";';

  if(roleType === 'gitrepo'){
    command += 'git clone ' + roleNameUri;
  }else if(roleType === 'galaxy'){
    command += 'ansible-galaxy install ' + roleNameUri + ' -p ' + rolesFolder;
  }else{
    return errorCallback('Invalid Type - allowed = gitrepo,galaxy ; given = ' + roleType);
  }
  ssh2_exec.executeCommand(command,null,successCallback,errorCallback,ansibleEngine);

};

/**
 * Get Role Files
 * @param roleName
 * @param successCallback
 * @param errorCallback
 * @param ansibleEngine
 */
exports.getRoleFiles = function(roleName, successCallback, errorCallback, ansibleEngine){

  var projectFolder = ansibleEngine.projectFolder;
  var command = 'cd "' + projectFolder + '/roles/' + roleName + '"; python /tmp/dir_tree.py';

  scp2_exec.copyFileToScriptEngine('./helpers/dir_tree.py','/tmp/dir_tree.py',ansibleEngine,function(){
    ssh2_exec.executeCommand(command,null,successCallback,errorCallback,ansibleEngine);
  }, errorCallback);

};

/**
 * GetProjectFiles
 * @param successCallback
 * @param errorCallback
 * @param ansibleEngine
 */
exports.getProjectFiles = function(successCallback, errorCallback, ansibleEngine){

  var projectFolder = ansibleEngine.projectFolder;
  var command = 'cd "' + projectFolder + '"; python /tmp/dir_tree.py';

  scp2_exec.copyFileToScriptEngine('./helpers/dir_tree.py','/tmp/dir_tree.py',ansibleEngine,function(response){
    ssh2_exec.executeCommand(command,null,successCallback,errorCallback,ansibleEngine);
  }, errorCallback);

};

/**
 * Get Tag List
 * @param project_folder - CWD while running the playbook
 * @param playbook_name - playbook name or relative path
 * @param inventory_file_name - inventory file name or relative path
 * @param successCallback
 * @param errorCallback
 * @param ansibleEngine
 */
exports.getTagList = function(project_folder, playbook_name, inventory_file_name, successCallback, errorCallback, ansibleEngine){

  var command = 'cd "' + project_folder + '"; python2.7 /tmp/list_tasks_json.py "' + playbook_name + '" -i "' + inventory_file_name + '" --list-hosts  --list-tasks-json ';

  if(ansibleEngine.customModules){
    command = 'export ANSIBLE_LIBRARY="' + ansibleEngine.customModules + '"; ' + command;
  }

  console.log("Command = " + command);

  scp2_exec.copyFileToScriptEngine('./helpers/list_tasks_json.py','/tmp/list_tasks_json.py',ansibleEngine,function(response){
    console.log("Executing sshc command = " + command);
    ssh2_exec.executeCommand(command,null,successCallback,errorCallback,ansibleEngine);
  }, errorCallback);



};

/**
 * Create a file using touch
 * @param fileAbsolutePath
 * @param successCallback
 * @param errorCallback
 * @param ansibleEngine
 */
exports.createFile = function(fileAbsolutePath, successCallback, errorCallback, ansibleEngine){

  var projectFolder = ansibleEngine.projectFolder;
  var command = 'touch "' + fileAbsolutePath + '"';

  ssh2_exec.executeCommand(command,null,successCallback,errorCallback,ansibleEngine);

};

/**
 * Get Inventory List
 * @param project_folder
 * @param successCallback
 * @param errorCallback
 * @param ansibleEngine
 */
exports.getInventoryList = function(project_folder, successCallback, errorCallback, ansibleEngine){

  var playbook_file_path = project_folder + '/';
  var command = 'cd "' + playbook_file_path + '" ; ls --ignore="*.*" -p | grep -v /';
  var ansiblePlaybookListResults = "";

  ssh2_exec.executeCommand(command,
    null,
    function(data){
      ansiblePlaybookListResults=data;
      var files = [];
      if(ansiblePlaybookListResults)
        files = ansiblePlaybookListResults.trim().split('\n');
      successCallback(files);
    },
    function(data){
      errorCallback(data)
    },
    ansibleEngine
  )

};

/**
 * Read Inventory File
 * @param project_folder
 * @param inventoryName
 * @param successCallback
 * @param errorCallback
 * @param ansibleEngine
 */
exports.readInventoryFile = function(project_folder, inventoryName, successCallback, errorCallback, ansibleEngine){

  var playbook_file_path = project_folder + '/';
  var command = 'cat "' + playbook_file_path + inventoryName + '"';

  ssh2_exec.executeCommand(command,
    null,
    successCallback,
    errorCallback,
    ansibleEngine
  )

};
