'use strict';
var Hapi = require('hapi');
var hapiVtree = require('hapi-vtree');
var humbleSession = require('../lib');
var sessionPre = require('../lib').pre;
var h = require('virtual-dom/h');

var server = new Hapi.Server();

server.connection({ port: '65444' });

server.register([{
    register: require('simple-session-store')
  }, {
    register: humbleSession,
    options: {
      password: 'some-pass',
      isSecure: false,
      sessionStoreName: 'simple-session-store',
      keepAlive: true
    }
  }, {
    register: hapiVtree
  }], function(err) {
  if (err) {
    console.log('Failed to register humble-session.');
  }

  server.route({
    method: 'GET',
    path: '/',
    config: {
      pre: [sessionPre],
      handler: function(req, reply) {
        var msg = req.pre.session.msg;
        reply.vtree(h('div', [
          h('div', [
            'Current message: ',
            msg
          ]),
          h('form', { method: 'post' }, [
            h('input', { type: 'text', name: 'msg' }),
            h('button', { type: 'submit' }, 'update session')
          ])
        ]));
      }
    }
  });

  server.route({
    method: 'POST',
    path: '/',
    config: {
      pre: [sessionPre],
      handler: function(req, reply) {
        req.pre.session.msg = req.payload.msg;
        reply.setSession(req.pre.session, function() {
          reply('session updated');
        });
      }
    }
  });

  server.start(function() {
    console.log('Server running at:', server.info.uri);
  });
});
