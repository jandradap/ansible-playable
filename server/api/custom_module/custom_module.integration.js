'use strict';

/* globals describe, expect, it, beforeEach, afterEach */

var app = require('../..');
import request from 'supertest';
import User from '../user/user.model';

var newCustomModule;

describe('CustomModule API:', function() {
  var token;
  var user;

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


  describe('POST /api/custom_modules/template.py/get', function() {
    var customModules;

    beforeEach(function(done) {
      request(app)
        .post('/api/custom_modules/template.py/get')
        .set('authorization', `Bearer ${token}`)
        .expect(200)
        .send({
          ansibleEngine: {
            host : '',
            customModules: '/'
          }
        })
        //.expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          customModules = res.text;
          done();
        });
    });

    it('should respond with module_template', function() {
      expect(customModules).to.contain('import AnsibleModule');
    });
  });


  describe('POST /api/custom_modules/test_module.py', function() {
    var customModules;

    beforeEach(function(done) {
      request(app)
        .post('/api/custom_modules/test_module.py')
        .set('authorization', `Bearer ${token}`)
        .expect(200)
        .send({
          ansibleEngine: {
            host : '',
            customModules: '/tmp'
          },
          custom_module_code: '#!/usr/bin/python\n' +
          '\n' +
          'import datetime\n' +
          'import json\n' +
          '\n' +
          'date = str(datetime.datetime.now())\n' +
          'print(json.dumps({\n' +
          '"time" : date\n' +
          '}))'
        })
        //.expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          customModules = res.text;
          done();
        });
    });

    it('should respond with "Saved"', function() {
      expect(customModules).to.contain('Saved');
    });
  });

  describe('POST /api/custom_modules/test_module.py/test', function() {
    var result;

    beforeEach(function(done) {
      request(app)
        .post('/api/custom_modules/test_module.py/test')
        .set('authorization', `Bearer ${token}`)
        .expect(200)
        .send({
          ansibleEngine: {
            host : '',
            customModules: '/tmp'
          },
          moduleArgs: {}
        })
        //.expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          result = res;
          done();
        });
    });

    it('should respond with 200', function() {
      expect(result.status).to.equal(200);
    });
  });

  //TODO: Add more test cases

});
