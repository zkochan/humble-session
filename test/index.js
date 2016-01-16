'use strict'
const expect = require('chai').expect
const Hapi = require('hapi')
const humbleSession = require('../lib')

describe('humble-session', function() {
  it('fails with no plugin options', function(done) {
    let server = new Hapi.Server()
    server.connection()
    server.register(humbleSession, function(err) {
      expect(err).to.exist
      done()
    })
  })

  it('fails with no password specified', function(done) {
    let server = new Hapi.Server()
    server.connection()
    server.register({
      register: humbleSession,
      options: {
        sessionStoreName: 'session-store',
      },
    }, function(err) {
      expect(err).to.exist
      done()
    })
  })

  it('fails with no sessionStoreName specified', function(done) {
    let server = new Hapi.Server()
    server.connection()
    server.register({
      register: humbleSession,
      options: {
        password: 'some-password',
      },
    }, function(err) {
      expect(err).to.exist
      done()
    })
  })

  it('passes with password and sessionStoreName specified', function(done) {
    let server = new Hapi.Server()
    server.connection()
    server.register({
      register: humbleSession,
      options: {
        password: 'some-password',
        sessionStoreName: 'session-store',
      },
    }, function(err) {
      expect(err).to.not.exist
      done()
    })
  })

  it('creates session', function(done) {
    let server = new Hapi.Server()
    server.connection()
    server.register([
      {
        register: require('simple-session-store'),
      },
      {
        register: humbleSession,
        options: {
          password: 'some-password',
          sessionStoreName: 'simple-session-store',
          ttl: 60 * 1000,
        },
      },
    ], function(err) {
      server.route({
        method: 'GET',
        path: '/create-session',
        handler: function(req, reply) {
          let session = {
            value: 'foo',
          }
          reply.setSession(session, function(err) {
            expect(err).to.not.exist
            reply('ok')
          })
        },
      })

      server.route({
        method: 'GET',
        path: '/read-session',
        config: {
          pre: [humbleSession.pre],
          handler: function(req, reply) {
            expect(req.pre.session.expires).to.be.a('Date')
            expect(req.pre.session.value).to.eq('foo')

            req.getSession(function(err, session) {
              expect(err).to.not.exist
              expect(req.pre.session.value).to.eq('foo')

              reply()
              done()
            })
          },
        },
      })

      server.inject('/create-session', function(res) {
        let header = res.headers['set-cookie']
        expect(header.length).to.equal(1)
        expect(header[0]).to.contain('sid=')
        expect(header[0]).to.contain('Max-Age=60')
        let cookie = header[0].match(/(?:[^\x00-\x20\(\)<>@\,;\:\\"\/\[\]\?\=\{\}\x7F]+)\s*=\s*(?:([^\x00-\x20\"\,\;\\\x7F]*))/)

        server.inject({
          url: '/read-session',
          method: 'GET',
          headers: {
            cookie: 'sid=' + cookie[1],
          },
        }, function() {})
      })
    })
  })
})
