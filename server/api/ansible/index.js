'use strict';

var express = require('express');
var controller = require('./ansible.controller');

var router = express.Router();

// List, create and get Ansible Jobs
router.get('/runs', controller.index);
router.get('/:id', controller.show);
router.post('/', controller.create);
router.put('/:id', controller.upsert);
router.patch('/:id', controller.patch);
router.delete('/:id', controller.destroy);

// Ansible Command line APIs
// - Create and modify inventory files
// - Create and modify playbooks
// - Create and modify roles
// - List tags
// - Create and modify files
// - Create and modify Var files
router.post('/modules/list', controller.modules);
router.post('/command', controller.command);
router.post('/execute', controller.execute);

router.post('/project/files', controller.project_files);

router.post('/playbook/get', controller.playbook_get);
router.post('/playbook/create', controller.playbook_create);
router.post('/playbook/delete', controller.playbook_delete);
router.post('/playbook/list', controller.playbook_list);


router.post('/roles/create', controller.roles_create);
router.post('/roles/list', controller.roles_list);
router.post('/roles/search/galaxy', controller.roles_search_galaxy);
router.post('/roles/search/github', controller.roles_search_github);
router.post('/roles/delete', controller.roles_delete);
router.post('/roles/files', controller.roles_files);
router.post('/roles/import', controller.roles_import);

router.post('/tags/list', controller.playbook_tags_list);

router.post('/files/create', controller.file_create);
router.post('/files/update', controller.file_update);
router.post('/files/delete', controller.file_delete);


router.post('/inventory/list', controller.inventory_list);
router.post('/inventory/get', controller.inventory_get);
router.post('/inventory/create', controller.inventory_create);
router.post('/inventory/delete', controller.inventory_delete);

router.post('/vars_file/groups/update', controller.update_groups_vars_file);
router.post('/vars_file/groups/get', controller.get_groups_vars_file);

router.post('/vars_file/hosts/update', controller.update_hosts_vars_file);
router.post('/vars_file/hosts/get', controller.get_hosts_vars_file);

router.post('/vars/hosts/get', controller.get_hosts_vars);
router.post('/vars/roles/get', controller.get_roles_vars);

router.get('/logs/:id', controller.getLogs);


module.exports = router;
