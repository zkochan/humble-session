'use strict';
const uid = require('uid-safe').sync
const thenify = require('thenify')

exports.register = function(plugin, opts, next) {
  if (!opts) {
    return next(new Error('Missing options'));
  }
  if (!opts.password) {
    return next(new Error('Missing required password in options'));
  }
  if (!opts.sessionStoreName) {
    return next(new Error('Missing required sessionStoreName in options'));
  }

  let cookieName = opts.cookieName || 'sid'
  let sessionService = plugin.plugins[opts.sessionStoreName]

  let cookieOpts = {
    encoding: 'iron',
    ttl: opts.ttl || 1000 * 60 * 60 * 24,
    password: opts.password,
    isSecure: opts.isSecure !== false,
    isHttpOnly: opts.isHttpOnly !== false,
    path: '/',
  }
  plugin.state(cookieName, cookieOpts)

  plugin.decorate('request', 'getSession', thenify(function(cb) {
    if (this.session) {
      cb(null, this.session)
      return
    }

    let sessionId = this.state[cookieName]
    if (!sessionId) {
      cb(null, {})
      return
    }
    sessionService.get(sessionId, (err, session) => {
      if (!err) {
        this.session = session
      }
      cb(err, session || {})
    })
  }))

  plugin.decorate('reply', 'setSession', thenify(function(updatedSession, cb) {
    let isNewSession = !updatedSession.sid
    if (isNewSession) {
      updatedSession.sid = uid(24)
    }
    if (isNewSession || opts.keepAlive) {
      updatedSession.expires = new Date(Date.now() + cookieOpts.ttl)
      this.state(cookieName, updatedSession.sid)
    }
    sessionService.set(updatedSession.sid, updatedSession, cb)
  }))

  next()
}

exports.register.attributes = {
  pkg: require('../package.json'),
}
