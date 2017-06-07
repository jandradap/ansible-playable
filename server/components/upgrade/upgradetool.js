/**
 * Created by mannam4 on 7/31/2016.
 */
var ssh2_exec = require('../ssh/ssh2_exec');
var config =  require('../../config/environment');

exports.getLogs = function(logfilename,successCallback,errorCallback){

  var logFile = '/opt/ehc-builder-scripts/logs/' + logfilename;
  var command = 'cat ' +logFile;

  var logFileData = '';

  console.log("Command = " + command);

  var localLogFile = 'logs/upgrade/upgrade.log';

  ssh2_exec.executeCommand(command,
    function(data){
      //Partial Data
      //console.log("Data = "+ data)
      //logFileData+=data
    },
    function(data){
      //Complete Data
      //console.log("Data =" + data)
      if(data)
      logFileData = (data.toString().replace('Stream :: close :: code: 0, signal: undefined',''));
      console.log("Success Callback =" + logFileData);
      successCallback(logFileData)
    },
    function(error){
      //Error Data
      //console.log("Error =" + error)
      if(error)
      logFileData+=error;
      console.log("Error Callback =" + logFileData);
      errorCallback(logFileData)
    }
  );

  /*var logFile = 'logs/upgrade/' + logfilename;
  var fs = require('fs');
  fs.readFile(logFile, function(err, data){
    if(err){
      errorCallback(err);
    }else{
      successCallback(data);
    }

  });*/
};


exports.upgrade = function(user,upgradeData,logfilename,dataCallback,completeCallback,errorCallback){
  var command = '/opt/ehc-builder-scripts/bin/ozone_upgrade.sh --force --restart > /opt/ehc-builder-scripts/logs/' + logfilename + " 2> >(sed $'s,.*,\\e[31m&\\e[m,'>&1)";

  var logFile = 'logs/upgrade/' + logfilename;

  var fs = require('filendir');

  fs.writeFile(logFile,command,{'flag':'a'});
  //return completeCallback(command);

  ssh2_exec.executeCommand(command,
    function(data){
      //Partial Data
      //console.log("Data = "+ data)
      completeCallback(data)
    },
    function(data){
      //Complete Data
      //console.log("Data =" + data)
      completeCallback(data)
    },
    function(error){
      //Error Data
      //console.log("Error =" + error)
      errorCallback(error)
    }
  )

};


exports.checkUpdates = function(user,dataCallback,completeCallback,errorCallback){
  var command = '/opt/ehc-builder-scripts/bin/check_updates.sh';

  var logFile = 'logs/upgrade/check_updates.log';

  var fs = require('filendir');

  fs.writeFile(logFile,command,{'flag':'a'});
  //return completeCallback(command);

  console.log("Updates command " + command);

  ssh2_exec.executeCommand(command,
    function(data){
      //Partial Data
      //console.log("Data = "+ data)
      dataCallback(data)
    },
    function(data){
      //Complete Data
      //console.log("Data =" + data)
      completeCallback(data)
    },
    function(error){
      //Error Data
      //console.log("Error =" + error)
      errorCallback(error)
    }
  )

};
