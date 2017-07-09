/**
 * Created by mannam4 on 7/8/2017.
 */

var winston = require('winston');

winston.add(winston.transports.File, {filename: './logs/server.log', json: false, colorize: true});

module.exports = winston;
