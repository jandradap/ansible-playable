'use strict';

/* globals sinon, describe, expect, it */

var proxyquire = require('proxyquire').noPreserveCache();

var ansibleCtrlStub = {
  index: 'ansibleCtrl.index',
  show: 'ansibleCtrl.show',
  create: 'ansibleCtrl.create',
  upsert: 'ansibleCtrl.upsert',
  patch: 'ansibleCtrl.patch',
  destroy: 'ansibleCtrl.destroy',
  modules: 'ansibleCtrl.modules',
  command: 'ansibleCtrl.command',
  execute: 'ansibleCtrl.execute',
  project_files: 'ansibleCtrl.project_files',
  playbook_get: 'ansibleCtrl.playbook_get',
  playbook_create: 'ansibleCtrl.playbook_create',
  playbook_delete: 'ansibleCtrl.playbook_delete',
  playbook_list: 'ansibleCtrl.playbook_list',
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy(),
};

// require the index with our stubbed out modules
var ansibleIndex = proxyquire('./index.js', {
  express: {
    Router() {
      return routerStub;
    }
  },
  './ansible.controller': ansibleCtrlStub
});

describe('Ansible API Router:', function() {
  it('should return an express router instance', function() {
    expect(ansibleIndex).to.equal(routerStub);
  });

  describe('POST /api/ansible/modules/list', function() {
    it('should route to ansible.controller.modules', function() {
      expect(routerStub.post
        .withArgs('/modules/list', 'ansibleCtrl.modules')
        ).to.have.been.calledOnce;
    });
  });

  describe('POST /api/ansible/command', function() {
    it('should route to ansible.controller.command', function() {
      expect(routerStub.post
        .withArgs('/command', 'ansibleCtrl.command')
      ).to.have.been.calledOnce;
    });
  });

  describe('POST /api/ansible/execute', function() {
    it('should route to ansible.controller.execute', function() {
      expect(routerStub.post
        .withArgs('/execute', 'ansibleCtrl.execute')
      ).to.have.been.calledOnce;
    });
  });

  describe('POST /api/ansible/project/files', function() {
    it('should route to ansible.controller.project_files', function() {
      expect(routerStub.post
        .withArgs('/project/files', 'ansibleCtrl.project_files')
      ).to.have.been.calledOnce;
    });
  });

  describe('POST /api/ansible/playbook/get', function() {
    it('should route to ansible.controller.playbook_get', function() {
      expect(routerStub.post
        .withArgs('/playbook/get', 'ansibleCtrl.playbook_get')
      ).to.have.been.calledOnce;
    });
  });

  describe('POST /api/ansible/playbook/create', function() {
    it('should route to ansible.controller.playbook_create', function() {
      expect(routerStub.post
        .withArgs('/playbook/create', 'ansibleCtrl.playbook_create')
      ).to.have.been.calledOnce;
    });
  });

  describe('POST /api/ansible/playbook/delete', function() {
    it('should route to ansible.controller.playbook_delete', function() {
      expect(routerStub.post
        .withArgs('/playbook/delete', 'ansibleCtrl.playbook_delete')
      ).to.have.been.calledOnce;
    });
  });

  describe('POST /api/ansible/playbook/list', function() {
    it('should route to ansible.controller.playbook_list', function() {
      expect(routerStub.post
        .withArgs('/playbook/list', 'ansibleCtrl.playbook_list')
      ).to.have.been.calledOnce;
    });
  });

  //TODO: Add the remaining test cases here

});
