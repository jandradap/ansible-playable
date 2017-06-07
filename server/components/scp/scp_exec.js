import config from '../../config/environment';
//var config = require('../../config/environment/development.js');
var client = require('scp2');


exports.copyFileToScriptEngine = function(sourcePath,destinationPath,ansibleEngine){

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

  scriptEngineConfig.destinationPath = destinationPath;
  var Client = require('scp2').Client;
  var cl = new Client(scriptEngineConfig);

  cl.on('keyboard-interactive', function(name, instr, lang, prompts, cb) {
    cb([connHostPassword]);
  });

  cl.on('error', function(error) {
    console.log("SCP Connect Error" + error);
    return error
  });

  cl.upload(sourcePath,destinationPath,function(err) {
    if(err){
      console.error(err)
    }else{
      console.log("Successfully uploaded file")
      cl.close()
    }
  })
};

exports.createFileOnScriptEngine = function(contents,destinationPath,successCallback,errorCallback,ansibleEngine){
  var Client = require('scp2').Client;
  var buffer = new Buffer(contents, "utf-8");

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


  var cl = new Client(scriptEngineConfig);

  cl.on('keyboard-interactive', function(name, instr, lang, prompts, cb) {
    cb([connHostPassword]);
  });

  cl.on('error', function(error) {
    console.log("SCP Connect Error" + error);
    errorCallback(error);
  });

  //cl.connect(scriptEngineConfig);

  var dirname = destinationPath.match(/(.*)[\/\\]/)[1]||'';

  console.log("direcname = " + dirname);

  cl.mkdir(dirname,function(err){
    if(err){
      errorCallback('Failed to create directory - ' + dirname + ' -' + err)
      return cl.close()
    }

    cl.write({
      destination: destinationPath,
      content: buffer
    }, function(err){
      if(err){
        console.error(err);
        errorCallback(err);

      }else{
        console.log("Success ");
        successCallback()
      }
      cl.close()
    });

  });



};

//exports.copyFileToScriptEngine('scp_exec.js','/tmp/ssh_tezt.js');
/*
exports.createFileOnScriptEngine('sdfdddddddddsfd','/tmp/testfile.txt', function(response){
  console.log("Success" + response)
}, function(response){
  console.log("Error" + response)
});
*/
