/**
 * Created by mannam4 on 11/3/2016.
 */

var fs = require('fs');

var dir = require('node-dir');
const path = require('path');
var options = {
    match:/vroConfig.py$/,
    matchDir: ['vro']
};


var results = []

dir.readFiles('C:\\Mumshad Files\\Projects\\EHC Builder\\python scripts\\Code\\source', options , function(err, content, filename, next) {
        console.log('processing content of file', filename);

        //const regex = /def (.*)\(.*\s+"""[^]+?Description: (.*)[^]+?Parameters:([^]+?)(Returns:|Return:)([^]+?)(Raises:|Raise:|)([^]+?)"""/g;
        var regex = /def (.*)\(.*\s+"""([^]+?)"""/g;

        var m;

        while ((m = regex.exec(content)) !== null) {
            // This is necessary to avoid infinite loops with zero-width matches
            if (m.index === regex.lastIndex) {
                regex.lastIndex++;
            }

            // The result can be accessed through the `m`-variable.
            // m.forEach((match, groupIndex) => {
            //     console.log(`Found match, group ${groupIndex}: ${match}`);
            //
            // });

            var methodName = m[1];
            var docStringComments = '"""' + m[2] + '"""';

            var regex2 = /"""[^]+(Description[^]+?)(Parameters[^]+?)?(Return[^]+?)?(Raise[^]+?)?"""/gm;
            var description = docStringComments.replace(regex2, '$1');
            var Parameters = docStringComments.replace(regex2, '$2');
            var Return = docStringComments.replace(regex2, '$3');
            var Raise = docStringComments.replace(regex2, '$4');

            var moduleName = path.parse(filename).name
            var packageName = path.parse(path.parse(filename).dir).name

            // console.log('Package: %s', packageName);
            // console.log('Module: %s', moduleName);
            // console.log('Method: %s', methodName);
            // console.log('Description: %s', description);

            var method = {
              moduleName: moduleName,
              methodName: methodName,
              packageName: packageName,
              description: description
            }

            results.push(method)
            // console.log('Parameters: %s', Parameters);
            // console.log('Return: %s', Return);
            // console.log('Raise: %s', Raise);

        }

        next();
    }, function(){

    console.log(results);

});


