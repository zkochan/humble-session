'use strict';

exports.register = function(plugin, opts, next) {
  if (!opts.password) {
    throw new Error('Missing required password in options');
  }
  if (!opts.sessionStoreName) {
    throw new Error('Missing required sessionStoreName in options');
  }

  var cookieName = opts.cookieName || 'sid';
  var sessionService = plugin.plugins[opts.sessionStoreName];

  var cookieOpts = {
    encoding: 'iron',
    ttl: opts.ttl || 1000 * 60 * 60 * 24,
    password: opts.password,
    isSecure: opts.isSecure !== false,
    isHttpOnly: opts.isHttpOnly !== false,
    path: '/'
  };
  plugin.state(cookieName, cookieOpts);

  plugin.decorate('request', 'getSession', function(cb) {
    var sessionId = this.state[cookieName];
    if (!sessionId) {
      cb({});
      return;
    }
    sessionService.get(sessionId, cb);
  });

  plugin.decorate('reply', 'setSession', function(updatedSession) {
    updatedSession.sid = updatedSession.sid || Math.random();
    this.state(cookieName, updatedSession.sid);
    sessionService.set(updatedSession.sid, updatedSession);
  });

  next();
};

exports.register.attributes = {
  pkg: require('../package.json')
};
