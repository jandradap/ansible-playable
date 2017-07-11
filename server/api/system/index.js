'use strict';

var express = require('express');
var controller = require('./system.controller');

var router = express.Router();

router.get('/logs/server', controller.serverLogs);
router.get('/logs/api', controller.apiLogs);

module.exports = router;
