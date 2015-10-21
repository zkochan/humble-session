'use strict';

var expect = require('chai').expect;
var Hapi = require('hapi');
var humbleSession = require('../lib');

describe('humble-session', function() {
  it('fails with no plugin options', function(done) {
    var server = new Hapi.Server();
    server.connection();
    server.register(humbleSession, function(err) {
      expect(err).to.exist;
      done();
    });
  });

  it('fails with no password specified', function(done) {
    var server = new Hapi.Server();
    server.connection();
    server.register({
      register: humbleSession,
      options: {
        sessionStoreName: 'session-store'
      }
    }, function(err) {
      expect(err).to.exist;
      done();
    });
  });

  it('fails with no sessionStoreName specified', function(done) {
    var server = new Hapi.Server();
    server.connection();
    server.register({
      register: humbleSession,
      options: {
        password: 'some-password'
      }
    }, function(err) {
      expect(err).to.exist;
      done();
    });
  });

  it('passes with password and sessionStoreName specified', function(done) {
    var server = new Hapi.Server();
    server.connection();
    server.register({
      register: humbleSession,
      options: {
        password: 'some-password',
        sessionStoreName: 'session-store'
      }
    }, function(err) {
      expect(err).to.not.exist;
      done();
    });
  });
});
