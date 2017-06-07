'use strict';

/* globals describe, expect, it, beforeEach, afterEach */

var app = require('../..');
import request from 'supertest';

var newAnsible;

describe('Ansible API:', function() {
  describe('GET /api/ansible', function() {
    var ansibles;

    beforeEach(function(done) {
      request(app)
        .get('/api/ansible')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          ansibles = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      expect(ansibles).to.be.instanceOf(Array);
    });
  });

  describe('POST /api/ansible', function() {
    beforeEach(function(done) {
      request(app)
        .post('/api/ansible')
        .send({
          name: 'New Ansible',
          info: 'This is the brand new ansible!!!'
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          newAnsible = res.body;
          done();
        });
    });

    it('should respond with the newly created ansible', function() {
      expect(newAnsible.name).to.equal('New Ansible');
      expect(newAnsible.info).to.equal('This is the brand new ansible!!!');
    });
  });

  describe('GET /api/ansible/:id', function() {
    var ansible;

    beforeEach(function(done) {
      request(app)
        .get(`/api/ansible/${newAnsible._id}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          ansible = res.body;
          done();
        });
    });

    afterEach(function() {
      ansible = {};
    });

    it('should respond with the requested ansible', function() {
      expect(ansible.name).to.equal('New Ansible');
      expect(ansible.info).to.equal('This is the brand new ansible!!!');
    });
  });

  describe('PUT /api/ansible/:id', function() {
    var updatedAnsible;

    beforeEach(function(done) {
      request(app)
        .put(`/api/ansible/${newAnsible._id}`)
        .send({
          name: 'Updated Ansible',
          info: 'This is the updated ansible!!!'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          updatedAnsible = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedAnsible = {};
    });

    it('should respond with the updated ansible', function() {
      expect(updatedAnsible.name).to.equal('Updated Ansible');
      expect(updatedAnsible.info).to.equal('This is the updated ansible!!!');
    });

    it('should respond with the updated ansible on a subsequent GET', function(done) {
      request(app)
        .get(`/api/ansible/${newAnsible._id}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          let ansible = res.body;

          expect(ansible.name).to.equal('Updated Ansible');
          expect(ansible.info).to.equal('This is the updated ansible!!!');

          done();
        });
    });
  });

  describe('PATCH /api/ansible/:id', function() {
    var patchedAnsible;

    beforeEach(function(done) {
      request(app)
        .patch(`/api/ansible/${newAnsible._id}`)
        .send([
          { op: 'replace', path: '/name', value: 'Patched Ansible' },
          { op: 'replace', path: '/info', value: 'This is the patched ansible!!!' }
        ])
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          patchedAnsible = res.body;
          done();
        });
    });

    afterEach(function() {
      patchedAnsible = {};
    });

    it('should respond with the patched ansible', function() {
      expect(patchedAnsible.name).to.equal('Patched Ansible');
      expect(patchedAnsible.info).to.equal('This is the patched ansible!!!');
    });
  });

  describe('DELETE /api/ansible/:id', function() {
    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete(`/api/ansible/${newAnsible._id}`)
        .expect(204)
        .end(err => {
          if(err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when ansible does not exist', function(done) {
      request(app)
        .delete(`/api/ansible/${newAnsible._id}`)
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
