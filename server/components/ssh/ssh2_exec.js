var Client = require('ssh2').Client;

//var exec = require('ssh-exec');

var config = require('../../config/environment');

exports.executeCommand = function(command, dataCallback,completeCallback,errorCallback, ansibleEngine, addScriptEndString){

  /*var fs = require('filendir');
  var time = new Date().getTime();
  //var logFile = 'logs/deploy/' + logfilename;
  var logFile = logfilelocation;*/

  var conn = new Client();

  if(!ansibleEngine) ansibleEngine = {};

  var connHost = ansibleEngine.ansibleHost || config.scriptEngine.host;
  var connUser = ansibleEngine.ansibleHostUser || config.scriptEngine.user;
  var connHostPassword = ansibleEngine.ansibleHostPassword || config.scriptEngine.password;

  var scriptEngineConfig = {
    host: connHost,
    port: 22,
    username: connUser,
    tryKeyboard: true
  };

  if(connHostPassword){
    scriptEngineConfig.password = connHostPassword;
  }else{
    scriptEngineConfig.privateKey = require('fs').readFileSync(config.scriptEngine.privateKey);
  }

  //fs.appendFile(logFile,command);
  //console.log("Writing Command to log file =" + command)
  /*fs.writeFile(logFile,"\n",{'flag':'a'});*/

  conn.on('keyboard-interactive', function(name, instr, lang, prompts, cb) {
    cb([connHostPassword]);
  });

  conn.on('error', function(error) {
    console.log("SSH Connect Error" + error);
    errorCallback(error);
  });

  conn.on('ready', function() {
    console.log('Client :: ready');
    console.log('Command :: ' + command);
    conn.exec(command, function(err, stream) {
      var callBackSent = false;

      var result_data = "";
      var error_data = "";
      var error = false;

      if (err) {
        console.log("Error=" + err);
        errorCallback(err);

      }
      stream.on('close', function(code, signal) {
        console.log('Stream :: close :: code: ' + code + ', signal: ' + signal);
        //completeCallback('Stream :: close :: code: ' + code + ', signal: ' + signal + '\nSCRIPT_FINISHED');
        if(addScriptEndString){
          //dataCallback call is what writes to logfile
          result_data += '\nSCRIPT_FINISHED';
          dataCallback(result_data);
        }

        if(code !== 0){
          errorCallback(error_data)
        }else{
          completeCallback(result_data)
        }
        conn.end();
      }).on('data', function(data) {
        console.log('STDOUT: ' + data);
        result_data += data;
        if(dataCallback){
          //dataCallback(data);
          dataCallback(result_data);
        }

      }).stderr.on('data', function(data) {
        console.log('STDERR: ' + data);
        error_data += data;
        error = true;
        //errorCallback(data);

      });
    });
  }).connect(scriptEngineConfig);
};


//exports.executeCommand(null,'python3.4 /data/ehc-builder/scripts/vipr/python/ehc-builder/scripts/bin/main.py vro  all --inputfile="configure_vmware_vro_Mumshad_Mannambeth_1468092975124.in" --logfile="configure_vmware_vro_Mumshad_Mannambeth_1468092975124"', 'logs/deploy/configure_vmware_vro_Mumshad_Mannambeth_1468092975124.log' )
/*

exports.executeCommand(null,'date','testfile.log',function(response){
  console.log(response)
},function(response){
  console.log(response)
},function(response){
  console.log(response)
})
*/
