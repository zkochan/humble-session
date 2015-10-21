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
    if (this.session) {
      cb(null, this.session);
      return;
    }
    var sessionId = this.state[cookieName];
    if (!sessionId) {
      cb(null, {});
      return;
    }
    sessionService.get(sessionId, function(err, session) {
      if (!err) {
        this.session = session;
      }
      cb(err, session);
    }.bind(this));
  });

  plugin.decorate('reply', 'setSession', function(updatedSession, cb) {
    updatedSession.sid = updatedSession.sid || Math.random();
    this.state(cookieName, updatedSession.sid);
    sessionService.set(updatedSession.sid, updatedSession, cb);
  });

  next();
};

exports.register.attributes = {
  pkg: require('../package.json')
};
