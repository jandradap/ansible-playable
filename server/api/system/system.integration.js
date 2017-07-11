'use strict';

/* globals describe, expect, it, beforeEach, afterEach */

var app = require('../..');
import request from 'supertest';

var newSystem;

describe('System API:', function() {
  describe('GET /api/system/logs/server', function() {
    var systems;

    beforeEach(function(done) {
      request(app)
        .get('/api/system/logs/server')
        .expect(200)
        //.expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          systems = res.text;
          done();
        });
    });

    it('should respond with String containing "Express server listening"', function() {
      expect(systems).to.contain('Express server listening');
    });
  });


  describe('GET /api/system/logs/api', function() {
    var systems;

    beforeEach(function(done) {
      request(app)
        .get('/api/system/logs/api')
        .expect(200)
        //.expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          console.log(JSON.stringify(res));
          systems = res.text;
          done();
        });
    });

    it('should respond with String', function() {
      expect(systems).to.contain('/api/system/logs');
    });
  });

});
