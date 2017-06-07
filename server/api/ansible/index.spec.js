'use strict';

/* globals sinon, describe, expect, it */

var proxyquire = require('proxyquire').noPreserveCache();

var ansibleCtrlStub = {
  index: 'ansibleCtrl.index',
  show: 'ansibleCtrl.show',
  create: 'ansibleCtrl.create',
  upsert: 'ansibleCtrl.upsert',
  patch: 'ansibleCtrl.patch',
  destroy: 'ansibleCtrl.destroy'
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
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

  describe('GET /api/ansible', function() {
    it('should route to ansible.controller.index', function() {
      expect(routerStub.get
        .withArgs('/', 'ansibleCtrl.index')
        ).to.have.been.calledOnce;
    });
  });

  describe('GET /api/ansible/:id', function() {
    it('should route to ansible.controller.show', function() {
      expect(routerStub.get
        .withArgs('/:id', 'ansibleCtrl.show')
        ).to.have.been.calledOnce;
    });
  });

  describe('POST /api/ansible', function() {
    it('should route to ansible.controller.create', function() {
      expect(routerStub.post
        .withArgs('/', 'ansibleCtrl.create')
        ).to.have.been.calledOnce;
    });
  });

  describe('PUT /api/ansible/:id', function() {
    it('should route to ansible.controller.upsert', function() {
      expect(routerStub.put
        .withArgs('/:id', 'ansibleCtrl.upsert')
        ).to.have.been.calledOnce;
    });
  });

  describe('PATCH /api/ansible/:id', function() {
    it('should route to ansible.controller.patch', function() {
      expect(routerStub.patch
        .withArgs('/:id', 'ansibleCtrl.patch')
        ).to.have.been.calledOnce;
    });
  });

  describe('DELETE /api/ansible/:id', function() {
    it('should route to ansible.controller.destroy', function() {
      expect(routerStub.delete
        .withArgs('/:id', 'ansibleCtrl.destroy')
        ).to.have.been.calledOnce;
    });
  });
});
