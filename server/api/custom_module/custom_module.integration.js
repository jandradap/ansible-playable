'use strict';

/* globals describe, expect, it, beforeEach, afterEach */

var app = require('../..');
import request from 'supertest';

var newCustomModule;

describe('CustomModule API:', function() {
  describe('GET /api/custom_modules', function() {
    var customModules;

    beforeEach(function(done) {
      request(app)
        .get('/api/custom_modules')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          customModules = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      expect(customModules).to.be.instanceOf(Array);
    });
  });

  describe('POST /api/custom_modules', function() {
    beforeEach(function(done) {
      request(app)
        .post('/api/custom_modules')
        .send({
          name: 'New CustomModule',
          info: 'This is the brand new customModule!!!'
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          newCustomModule = res.body;
          done();
        });
    });

    it('should respond with the newly created customModule', function() {
      expect(newCustomModule.name).to.equal('New CustomModule');
      expect(newCustomModule.info).to.equal('This is the brand new customModule!!!');
    });
  });

  describe('GET /api/custom_modules/:id', function() {
    var customModule;

    beforeEach(function(done) {
      request(app)
        .get(`/api/custom_modules/${newCustomModule._id}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          customModule = res.body;
          done();
        });
    });

    afterEach(function() {
      customModule = {};
    });

    it('should respond with the requested customModule', function() {
      expect(customModule.name).to.equal('New CustomModule');
      expect(customModule.info).to.equal('This is the brand new customModule!!!');
    });
  });

  describe('PUT /api/custom_modules/:id', function() {
    var updatedCustomModule;

    beforeEach(function(done) {
      request(app)
        .put(`/api/custom_modules/${newCustomModule._id}`)
        .send({
          name: 'Updated CustomModule',
          info: 'This is the updated customModule!!!'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          updatedCustomModule = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedCustomModule = {};
    });

    it('should respond with the updated customModule', function() {
      expect(updatedCustomModule.name).to.equal('Updated CustomModule');
      expect(updatedCustomModule.info).to.equal('This is the updated customModule!!!');
    });

    it('should respond with the updated customModule on a subsequent GET', function(done) {
      request(app)
        .get(`/api/custom_modules/${newCustomModule._id}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          let customModule = res.body;

          expect(customModule.name).to.equal('Updated CustomModule');
          expect(customModule.info).to.equal('This is the updated customModule!!!');

          done();
        });
    });
  });

  describe('PATCH /api/custom_modules/:id', function() {
    var patchedCustomModule;

    beforeEach(function(done) {
      request(app)
        .patch(`/api/custom_modules/${newCustomModule._id}`)
        .send([
          { op: 'replace', path: '/name', value: 'Patched CustomModule' },
          { op: 'replace', path: '/info', value: 'This is the patched customModule!!!' }
        ])
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          patchedCustomModule = res.body;
          done();
        });
    });

    afterEach(function() {
      patchedCustomModule = {};
    });

    it('should respond with the patched customModule', function() {
      expect(patchedCustomModule.name).to.equal('Patched CustomModule');
      expect(patchedCustomModule.info).to.equal('This is the patched customModule!!!');
    });
  });

  describe('DELETE /api/custom_modules/:id', function() {
    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete(`/api/custom_modules/${newCustomModule._id}`)
        .expect(204)
        .end(err => {
          if(err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when customModule does not exist', function(done) {
      request(app)
        .delete(`/api/custom_modules/${newCustomModule._id}`)
        .expect(404)
        .end(err => {
          if(err) {
            return done(err);
          }
          done();
        });
    });
  });
});
