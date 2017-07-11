'use strict';

/* globals sinon, describe, expect, it */

var proxyquire = require('proxyquire').noPreserveCache();

var systemCtrlStub = {
  serverLogs: 'systemCtrl.serverLogs',
  apiLogs: 'systemCtrl.apiLogs'
};

var routerStub = {
  get: sinon.spy(),
  serverLogs: sinon.spy(),
  apiLogs: sinon.spy()
};

// require the index with our stubbed out modules
var systemIndex = proxyquire('./index.js', {
  express: {
    Router() {
      return routerStub;
    }
  },
  './system.controller': systemCtrlStub
});

describe('System API Router:', function() {
  it('should return an express router instance', function() {
    expect(systemIndex).to.equal(routerStub);
  });

  describe('GET /api/system/logs/server', function() {
    it('should route to system.controller.serverLogs', function() {
      expect(routerStub.get
        .withArgs('/logs/server', 'systemCtrl.serverLogs')
      ).to.have.been.calledOnce;
    });
  });

  describe('GET /api/system/logs/api', function() {
    it('should route to system.controller.apiLogs', function() {
      expect(routerStub.get
        .withArgs('/logs/api', 'systemCtrl.apiLogs')
      ).to.have.been.calledOnce;
    });
  });

});
