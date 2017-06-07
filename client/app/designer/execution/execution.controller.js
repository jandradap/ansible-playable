'use strict';
const angular = require('angular');

/*@ngInject*/
export function executionController($scope,$sce, $uibModalInstance, $timeout, ansi2html, ansible, tags, selectedProject, selectedPlaybook, selectedPlay, executionType, executionName, readOnly, runData, projectFolder, roleName) {
  'ngInject';
  $scope.view = 'console';
  $scope.selectedInventoryFile = {value:null};
  $scope.verbose_detail = {value:null};
  $scope.verbose = {value:'verbose'};
  $scope.check_mode = {
    value: 'No_Check'
  };
  $scope.additional_tags = {show: false};
  $scope.additional_vars = {show: false};
  $scope.refreshLog = true;
  $scope.all_tags = [];
  $scope.all_hosts = [];
  $scope.readOnly = readOnly;
  $scope.readyForPlay = false;

  /**
   * Execute Ansible Playbook
   */
  $scope.executeAnsiblePlayBook = function(){
    $scope.AnsiblePlayBookLoading = true;
    var reqBody = {};
    //reqBody.inventory_file_contents = inventory_file_contents;
    //reqBody.playbook_file_contents = yaml;
    //reqBody.tags = tags || [];
    reqBody.tags = [];

    $scope.all_tags.map(tag => {
      if(tag.selected){
      if(tag.name)
        reqBody.tags.push(tag.name.trim())
    }
  });

    reqBody.limit_to_hosts = [];

    $scope.all_hosts.map(host => {
      if(host.selected){
      if(host.name)
        reqBody.limit_to_hosts.push(host.name.trim())
    }
  });

    reqBody.verbose = $scope.verbose_detail.value || $scope.verbose.value;
    reqBody.check_mode = $scope.check_mode.value;

    reqBody.inventory_file_name = $scope.selectedInventoryFile.value;

    if(roleName){
      reqBody.inventory_file_name = roleName + '/tests/' + reqBody.inventory_file_name;
    }


    console.log("Check Mode = " + reqBody.check_mode);

    reqBody.selectedPlaybook = selectedPlaybook.playbook;
    reqBody.executionType  = executionType;
    reqBody.executionName  = executionName;

    reqBody.ansibleEngine = angular.copy(selectedProject.ansibleEngine);

    // Override project folder for roles
    if(projectFolder)
      reqBody.ansibleEngine.projectFolder = projectFolder;

    if(selectedPlay && selectedPlay.play)
      reqBody.host = selectedPlay.play.hosts;

    $scope.result = "Running...";

    ansible.executeAnsiblePlayBook(reqBody,function(response){
      //$scope.result = $sce.trustAsHtml(ansi2html.toHtml(response.data).replace(/\n/g, "<br>"));
      $scope.refreshLog = true;
      $scope.executionData = response.data;

      setTimeout(function(){
        $scope.refreshLogs();
      },3000);

    }, function(response){
      if(response.data)
        $scope.result = $sce.trustAsHtml(ansi2html.toHtml(response.data).replace(/\n/g, "<br>"));
      $scope.AnsiblePlayBookLoading = false;
      console.log("error" + $scope.result)
    }, 'PlaybookExecutionModal');

  };

  /*setTimeout(function(){
   $scope.executeAnsiblePlayBook();
   },200);*/


  /**
   * Get logs
   */
  $scope.getLogs = function(){
    ansible.getLogs($scope.executionData,function(successResponse) {
      $scope.result = $sce.trustAsHtml(ansi2html.toHtml(successResponse.data.replace('SCRIPT_FINISHED','')).replace(/\n/g, "<br>"));

      if(successResponse.data.indexOf('SCRIPT_FINISHED') > -1){
        $scope.refreshLog = false;
        $scope.AnsiblePlayBookLoading = false;
      }
      $scope.processAnsibleOutput(successResponse.data)

    });
  };

  /**
   * Refersh Logs
   */
  $scope.refreshLogs = function(){
    if($scope.logRefreshTimer){
      $timeout.cancel( $scope.logRefreshTimer );
    }

    $scope.getLogs();
    $scope.logRefreshTimer = $timeout(
      function(){
        //$scope.getLogs(tile);
        if($scope.refreshLog) {
          $scope.refreshLogs();
        }
      },
      10000
    );

    $scope.$on(
      "$destroy",
      function( event ) {
        $timeout.cancel( $scope.logRefreshTimer );
      }
    );

  };

  /**
   * Close the modal
   */
  $scope.ok = function () {
    $uibModalInstance.close(null);
  };

  /**
   * Cancel modal
   */
  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };

  /**
   * Run a random command on the server
   * TODO: Remove this later.
   * @param command
   */
  $scope.runCommand = function(command){
    command = command || $scope.command;
    ansible.executeCommand( command,
      function(response){
        $scope.result = $sce.trustAsHtml(ansi2html.toHtml(response.data).replace(/\n/g, "<br>").replace(/ /g,"&nbsp;"));

      }, function(response){
        $scope.result = $sce.trustAsHtml(ansi2html.toHtml(response.data).replace(/\n/g, "<br>"));

      })
  };

  /**
   * Run Ansible Playbook
   * @constructor
   */
  $scope.Run = function(){
    $scope.executeAnsiblePlayBook();
  };

  /**
   * This is used when viewing the logs from the Runs view
   */
  if($scope.readOnly){
    $scope.executionData = runData;
    $scope.refreshLog = true;
    $scope.refreshLogs()
  }

  /**
   * Get List of inventory files
   */
  $scope.listOfInventoryFiles = function(){

    var rolesTestFolder = null;

    if(roleName){
      rolesTestFolder = projectFolder + '/' + roleName + '/tests'
    }

    ansible.getInventoryList(function(response){
        $scope.inventoryFiles = response.data;
        if($scope.inventoryFiles.length)
          $scope.selectedInventoryFile = {value:$scope.inventoryFiles[0]};
        /**
         * Run Get Tags
         */
        if(!readOnly)
          $scope.getTags();
      },
      function(response){
        /*$scope.err_msg = response.data;*/
        $scope.result = $sce.trustAsHtml(ansi2html.toHtml(response.data).replace(/\n/g, "<br>"));
        $scope.view = 'console'
      },rolesTestFolder)
  };

  $scope.listOfInventoryFiles();

  /**
   * Get List of Tags based on playbook and inventory file
   */
  $scope.getTags = function(){
    var inventory_file_name = $scope.selectedInventoryFile.value;

    if(roleName){
      inventory_file_name = roleName + '/tests/' + inventory_file_name;
    }

    var selectedPlaybookName = selectedPlaybook.playbook;

    var ansibleEngine = angular.copy(selectedProject.ansibleEngine);

    // Override project folder for roles
    if(projectFolder)
      ansibleEngine.projectFolder = projectFolder;

    ansible.getTagList(selectedPlaybookName,inventory_file_name,ansibleEngine,
      function(response){
        console.log(response.data)

        /*var re = /TAGS: \[(.*)\]/g;
         var m;

         var all_tags = []

         while ((m = re.exec(response.data)) !== null) {
         if (m.index === re.lastIndex) {
         re.lastIndex++;
         }
         // View your result using the m-variable.
         // eg m[0] etc.
         if(m[1])
         all_tags.push(m[1])
         }

         $scope.all_tags = all_tags.join(',').split(',');*/

        if(!response.data.playbooks)return null;

        var playbooks = response.data.playbooks;
        $scope.all_hosts = [];
        $scope.all_tags = [];

        angular.forEach(playbooks, playbook => {
          angular.forEach(playbook.plays, play => {
          $scope.all_hosts = $scope.all_hosts.concat(play.hosts);
        $scope.all_tags = $scope.all_tags.concat(play.tags);
        angular.forEach(play.tasks, task => {
          $scope.all_tags = $scope.all_tags.concat(task.tags);
      })
      })
      });

        // Get Unique List of tags
        $scope.all_tags = Array.from(new Set($scope.all_tags));

        // Get Unique List of hosts
        $scope.all_hosts = Array.from(new Set($scope.all_hosts));

        $scope.all_hosts = $scope.all_hosts.map(host => {return {name:host,selected:false}});

        $scope.all_tags = $scope.all_tags.map(tag => {return {name:tag,selected:false}});

        if(tags){
          angular.forEach(tags, tag => {
            var tag_found = false;
          angular.forEach($scope.all_tags, (all_tag,index) => {
            if(tag == all_tag.name){
            tag_found = true;
            all_tag.selected = true
          }
        });
          if(!tag_found)
            $scope.all_tags.push({name:tag,selected:true})
        })

        }

        $scope.readyForPlay = true;

      },
      function(error){
        //console.log(error.data)
        //$scope.err_msg = error.data;
        $scope.result = $sce.trustAsHtml(ansi2html.toHtml(error.data).replace(/\n/g, "<br>"));
        $scope.view = 'console'
      })

  };

  /**
   * Process Ansible Output and show graphically
   * @param ansibleOutput
   */
  $scope.processAnsibleOutput_old = function(ansibleOutput){

    $scope.ansibleOutputResult = [];
    //https://regex101.com/r/yD6lZ6/1
    //var re = /(PLAY|TASK) \[(.*)\] (.*)\n(.*?):([^]*?)(?=TASK|PLAY)/gm;
    //var re = /(PLAY|TASK) \[(.*)\] (.*)\n(?:(.*?)\s?(.*): \[(.*)\](.*)=> ([^]*?)(?=TASK|PLAY)|(.*?): \[(.*)\](.*)|(.*)|(?=TASK|PLAY))/gm
    //var re = /(PLAY|TASK) \[(.*)\] (.*)\n(?:(.*?)\s?(.*): \[(.*)\](.*)=> ([^]*?)(?=\n\n)|(.*?): \[(.*)\](.*)|(.*)|(?=\n\n))/gm;
    var re = /({[^]+})/g
    var m;

    while ((m = re.exec(ansibleOutput)) !== null) {
      if (m.index === re.lastIndex) {
        re.lastIndex++;
      }
      // View your result using the m-variable.
      // eg m[0] etc.

      var type = m[1]; //TASK,PLAY
      var name = m[2]; // ansible-role-vra : debug delete instance
      var status = m[5]; //ok, skipping, failed
      var host = m[6]; //localhost , localhost -> localhost
      var status_2 = m[7];
      var result = m[8];

      if(result){
        //var result_object_string = result.replace(/({[^]+})[^]+/,"$1");
        var result_object_string = result;
        var resultObject = null;
        try{
          resultObject = JSON.parse(result_object_string);

          //resultObject.formattedStdErr = resultObject.stderr.replace(/\\r\\n/g,'<br>').replace(/\\n/g, "<br>");
          resultObject.formattedStdErr = resultObject.stderr.replace(/\n/g,'<br>');
          resultObject.formattedStdOut = resultObject.stderr.replace(/\n/g,'<br>');

        }catch(e){
          console.log("Error converting ansible output result object to javascript")
        }
      }

      $scope.ansibleOutputResult.push({
        type:type,
        name:name,
        status:status,
        host:host,
        status_2:status_2,
        resultString:result,
        resultObject:resultObject
      })

    }

  }


  $scope.processAnsibleOutput = function(ansibleOutput){

    $scope.ansibleOutputResult = [];
    $scope.ansibleOutputObject = {
      'plays' : [],
      'stats' : {}

    }
    //var re = /(.*{[^]+}.*)/g;
    var re = /--------BEGIN--------([^]+?)--------END--------/gm;
    var m;

    while ((m = re.exec(ansibleOutput)) !== null) {
      if (m.index === re.lastIndex) {
        re.lastIndex++;
      }
      // View your result using the m-variable.
      // eg m[0] etc.

      try{
        //$scope.ansibleOutputObject = JSON.parse(m[1]);
        var resultItem = JSON.parse(m[1]);
        if('play' in resultItem){
          $scope.ansibleOutputObject.plays.push(resultItem);
        } else if('task' in resultItem){

          var current_play = $scope.ansibleOutputObject.plays[$scope.ansibleOutputObject.plays.length-1]
          var newTask = true;
          angular.forEach(current_play.tasks, (task, index)=>{
            if(task.task.id === resultItem.task.id){
            newTask = false;
            current_play.tasks[index] = resultItem
          }
        })


          if(newTask)
            current_play.tasks.push(resultItem);

        } else if('stats' in resultItem){
          $scope.ansibleOutputObject.stats = resultItem.stats;
        }

      }catch(e){
        console.log("Error parsing ansible output" + e);
      }


      //var plays = $scope.ansibleOutputObject.plays;

    }

    console.log($scope.ansibleOutputObject);

    /*while ((m = re.exec(ansibleOutput)) !== null) {
     if (m.index === re.lastIndex) {
     re.lastIndex++;
     }
     // View your result using the m-variable.
     // eg m[0] etc.



     var type = m[1]; //TASK,PLAY
     var name = m[2]; // ansible-role-vra : debug delete instance
     var status = m[5]; //ok, skipping, failed
     var host = m[6]; //localhost , localhost -> localhost
     var status_2 = m[7];
     var result = m[8];

     if(result){
     //var result_object_string = result.replace(/({[^]+})[^]+/,"$1");
     var result_object_string = result;
     var resultObject = null;
     try{
     resultObject = JSON.parse(result_object_string);

     //resultObject.formattedStdErr = resultObject.stderr.replace(/\\r\\n/g,'<br>').replace(/\\n/g, "<br>");
     resultObject.formattedStdErr = resultObject.stderr.replace(/\n/g,'<br>');
     resultObject.formattedStdOut = resultObject.stderr.replace(/\n/g,'<br>');

     }catch(e){
     console.log("Error converting ansible output result object to javascript")
     }
     }

     $scope.ansibleOutputResult.push({
     type:type,
     name:name,
     status:status,
     host:host,
     status_2:status_2,
     resultString:result,
     resultObject:resultObject
     })

     }*/

  }
}

export default angular.module('webAppApp.execution', [])
  .controller('ExecutionController', executionController)
  .name;
