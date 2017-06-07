'use strict';

var express = require('express');
var controller = require('./custom_module.controller');

var router = express.Router();

router.post('/query', controller.index);
router.post('/:custom_module/test', controller.testModule);
router.post('/:custom_module/get', controller.show);
router.post('/:custom_module', controller.create);
router.put('/:id', controller.upsert);
router.patch('/:id', controller.patch);
router.delete('/:id', controller.destroy);

module.exports = router;
