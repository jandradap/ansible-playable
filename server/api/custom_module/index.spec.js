'use strict';

/* globals sinon, describe, expect, it */

var proxyquire = require('proxyquire').noPreserveCache();

var customModuleCtrlStub = {
  index: 'customModuleCtrl.index',
  show: 'customModuleCtrl.show',
  create: 'customModuleCtrl.create',
  upsert: 'customModuleCtrl.upsert',
  patch: 'customModuleCtrl.patch',
  destroy: 'customModuleCtrl.destroy'
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var customModuleIndex = proxyquire('./index.js', {
  express: {
    Router() {
      return routerStub;
    }
  },
  './custom_module.controller': customModuleCtrlStub
});

describe('CustomModule API Router:', function() {
  it('should return an express router instance', function() {
    expect(customModuleIndex).to.equal(routerStub);
  });

  describe('GET /api/custom_modules/query', function() {
    it('should route to customModule.controller.index', function() {
      expect(routerStub.post
        .withArgs('/query', 'customModuleCtrl.index')
        ).to.have.been.calledOnce;
    });
  });

  describe('GET /api/custom_modules/:custom_module/get', function() {
    it('should route to customModule.controller.show', function() {
      expect(routerStub.post
        .withArgs('/:custom_module/get', 'customModuleCtrl.show')
        ).to.have.been.calledOnce;
    });
  });

  describe('POST /api/custom_modules/:custom_module', function() {
    it('should route to customModule.controller.create', function() {
      expect(routerStub.post
        .withArgs('/:custom_module', 'customModuleCtrl.create')
        ).to.have.been.calledOnce;
    });
  });

  describe('PUT /api/custom_modules/:id', function() {
    it('should route to customModule.controller.upsert', function() {
      expect(routerStub.put
        .withArgs('/:id', 'customModuleCtrl.upsert')
        ).to.have.been.calledOnce;
    });
  });

  describe('PATCH /api/custom_modules/:id', function() {
    it('should route to customModule.controller.patch', function() {
      expect(routerStub.patch
        .withArgs('/:id', 'customModuleCtrl.patch')
        ).to.have.been.calledOnce;
    });
  });

  describe('DELETE /api/custom_modules/:id', function() {
    it('should route to customModule.controller.destroy', function() {
      expect(routerStub.delete
        .withArgs('/:id', 'customModuleCtrl.destroy')
        ).to.have.been.calledOnce;
    });
  });
});
