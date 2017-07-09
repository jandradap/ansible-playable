/**
 * Created by mannam4 on 7/8/2017.
 */

var winston = require('winston');

import config from '../../config/environment';

winston.add(winston.transports.File, {
    filename: config.paths.local_server_logfile,
    json: false,
    colorize: true,
    maxsize: '10485760',
    maxFiles: '10'
});

module.exports = winston;
