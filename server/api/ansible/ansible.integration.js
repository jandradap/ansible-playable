'use strict';

/* globals describe, expect, it, beforeEach, afterEach */

var app = require('../..');
import request from 'supertest';
import User from '../user/user.model';

var newAnsible;

describe('Ansible API:', function() {
  var token;
  var user;
  var ansible_job;

  // Clear users before testing
  before(function() {
    return User.remove().then(function() {
      user = new User({
        name: 'Fake User',
        email: 'test@example.com',
        password: 'password'
      });

      return user.save();
    });
  });

  // Clear users after testing
  after(function() {
    return User.remove();
  });

  describe('GET /api/users/me', function() {

    before(function(done) {
      request(app)
        .post('/auth/local')
        .send({
          email: 'test@example.com',
          password: 'password'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          token = res.body.token;
          done();
        });
    });

    it('should respond with a user profile when authenticated', function(done) {
      request(app)
        .get('/api/users/me')
        .set('authorization', `Bearer ${token}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          expect(res.body._id.toString()).to.equal(user._id.toString());
          done();
        });
    });

    it('should respond with a 401 when not authenticated', function(done) {
      request(app)
        .get('/api/users/me')
        .expect(401)
        .end(done);
    });
  });

  describe('POST /modules/list', function() {
    var modules;

    beforeEach(function(done) {
      request(app)
        .post('/api/ansible/modules/list')
        .timeout(10000)
        .set('authorization', `Bearer ${token}`)
        .send({
          ansibleEngine: {
            'host' : ''
          }
        })
        .expect(200)
        //.expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          modules = res.text;
          done();
        });
    });


    it('should respond with list of Ansible Modules (containing ping module)', function() {
      expect(modules).to.contain('ping');
    });
  });


  describe('POST /command to execute a sample command - echo "Hello World"', function() {
    var modules;

    beforeEach(function(done) {
      request(app)
        .post('/api/ansible/command')
        .set('authorization', `Bearer ${token}`)
        .send({
          command: 'echo "Hello World"'
        })
        .expect(200)
        //.expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          modules = res.text;
          done();
        });
    });


    it('should respond with the result of command', function() {
      expect(modules).to.contain('Hello World');
    });
  });


  describe('POST /inventory/create', function() {
    var result;

    beforeEach(function(done) {
      request(app)
        .post('/api/ansible/inventory/create')
        .set('authorization', `Bearer ${token}`)
        .send({
          ansibleEngine: {
            host : '',
            projectFolder: '/tmp'
          },
          inventoryName: 'inventory.txt',
          inventoryFileContents: 'localhost ansible_connection=local'
        })
        .expect(200)
        //.expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          result = res.text;
          done();
        });
    });


    it('should respond with "file written"', function() {
      expect(result).to.contain('file written');
    });
  });


  describe('POST /playbook/create', function() {
    var result;

    beforeEach(function(done) {
      request(app)
        .post('/api/ansible/playbook/create')
        .set('authorization', `Bearer ${token}`)
        .send({
          ansibleEngine: {
            host : '',
            projectFolder: '/tmp'
          },
          playbookName: 'test_playbook.yml',
          playbookFileContents: '-\n' +
          ' name: "Test Play1"\n' +
          ' hosts: localhost\n' +
          ' tasks:\n' +
          '  -       name: "Test Task1"\n' +
          '          ping:\n'
        })
        .expect(200)
        //.expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          result = res.text;
          done();
        });
    });


    it('should respond with "file written"', function() {
      expect(result).to.contain('file written');
    });
  });


  describe('POST /execute', function() {

    beforeEach(function(done) {
      request(app)
        .post('/api/ansible/execute')
        .set('authorization', `Bearer ${token}`)
        .send({
          ansibleEngine: {
            host : '',
            projectFolder: '/tmp/'
          },
          selectedPlaybook: 'test_playbook.yml',
          inventory_file_name: 'inventory.txt',
        })
        .expect(201)
        //.expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          ansible_job = res.body;
          done();
        });
    });


    it('should respond with an Ansible Job object', function() {
      expect(ansible_job.selectedPlaybook).to.equal('test_playbook.yml');
    });
  });

  describe('GET /:id', function() {

    beforeEach(function(done) {
      request(app)
        .get('/api/ansible/' + ansible_job._id)
        .set('authorization', `Bearer ${token}`)
        .expect(200)
        //.expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          ansible_job = res.body;
          console.log("ansible_job " + JSON.stringify(ansible_job));
          done();
        });
    });


    it('should respond with an Ansible Job object', function() {
      expect(ansible_job.selectedPlaybook).to.equal('test_playbook.yml');
    });
  });

  describe('POST /playbook/delete', function() {
    var result;

    beforeEach(function(done) {
      request(app)
        .post('/api/ansible/playbook/delete')
        .set('authorization', `Bearer ${token}`)
        .send({
          ansibleEngine: {
            host : '',
            projectFolder: '/tmp'
          },
          playbookName: 'test_playbook.yml',
        })
        .expect(200)
        //.expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          result = res;
          done();
        });
    });


    it('should respond with status code 200', function() {
      expect(result.status).to.equal(200);
    });
  });


  describe('POST /inventory/delete', function() {
    var result;

    beforeEach(function(done) {
      request(app)
        .post('/api/ansible/inventory/delete')
        .set('authorization', `Bearer ${token}`)
        .send({
          ansibleEngine: {
            host : '',
            projectFolder: '/tmp'
          },
          inventoryName: 'inventory.txt',
        })
        .expect(200)
        //.expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          result = res;
          done();
        });
    });


    it('should respond with status code 200', function() {
      expect(result.status).to.equal(200);
    });
  });

  //TODO: Add more Ansible test cases here

});
