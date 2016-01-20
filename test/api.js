var assert = require('assert');
var request = require('supertest');

var app = require('../index');
var mongo = require('../lib/mongo');

var DATABASE_URL = 'mongodb://localhost:27017/api'

describe('Tutorial REST API', function() {
  before(function(done) {
    mongo.initialize(DATABASE_URL, done);
  });
  describe('Create user', function() {
    it('returns the created resource on success', function(done) {

      var validUserResource = {
        profile_name: 'John Smith',
        username: 'johnsmith',
        email: 'john@example.com'
      };

      request(app)
        .post('/user')
        .send(validUserResource)
        .expect(201)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }

          assert.equal(res.body.profile_name, validUserResource.profile_name);
          assert.equal(res.body.username, validUserResource.username);
          assert.equal(res.body.email, validUserResource.email);
          done();
        });
    });
    it('returns 400, with error message on bad request', function(done) {

      var badUserResource = {
        // Missing two properties
        username: 'janesmith'
      };

      request(app)
        .post('/user')
        .send(badUserResource)
        .expect(400)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }

          assert.equal(res.body.errors[0], 'profile name required');
          assert.equal(res.body.errors[1], 'invalid email');
          assert.equal(res.body.errors[2], 'email required');
          done();
        });
    });
  });
});
