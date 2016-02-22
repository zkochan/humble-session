# humble-session

A [hapi](https://hapijs.com) session plugin. Instead of storing the entire
session in the cookies, humble-session stores only an ID. The rest of the data
is stored in the server's session microservice. In order to avoid fetching the
session data when it is not needed, the session object is fetched only through
the session prerequisite.

[![Dependency Status](https://david-dm.org/zkochan/humble-session/status.svg?style=flat)](https://david-dm.org/zkochan/humble-session)
[![Build Status](https://travis-ci.org/zkochan/humble-session.svg?branch=master)](https://travis-ci.org/zkochan/humble-session)
[![npm version](https://badge.fury.io/js/humble-session.svg)](http://badge.fury.io/js/humble-session)


## Installation

```
npm install --save humble-session
```


## Options

- `sessionStoreName` - the plugin name that will store the sessions.
- `cookie` - the cookie name. Defaults to `'sid'`.
- `password` - used for Iron cookie encoding.
- `ttl` - sets the cookie expires time in milliseconds. Defaults to single browser session (ends
  when browser closes).
- `keepAlive` - if `true`, automatically sets the session cookie after validation to extend the
  current session for a new `ttl` duration. Defaults to `false`.
- `isSecure` - if `false`, the cookie is allowed to be transmitted over insecure connections which
  exposes it to attacks. Defaults to `true`.
- `isHttpOnly` - if `false`, the cookie will not include the 'HttpOnly' flag. Defaults to `true`.


## Usage

Register the plugin:

```js
var Hapi = require('hapi');

var server = new Hapi.Server();

server.register([{
    register: require('simple-session-store')
  }, {
    register: require('humble-session'),
    options: {
      sessionStoreName: 'simple-session-store',
      password: 'secret'
    }
  }], function(err) {
  if (err) {
    console.log("Failed to register humble-session.");
  }
});
```

Use it as a prerequisite in a route:

``` js
var sessionPre = require('humble-session').pre;

exports.register = function(server, options, next) {
  server.route({
    method: 'GET',
    path: '/get-msg',
    config: {
      pre: [sessionPre],
      handler: function(req, reply) {
        reply(req.pre.session.msg);
      }
    }
  });

  next();
};
```

Update it by calling `server.setSession(updatedSession)`:

``` js
var sessionPre = require('humble-session').pre;

exports.register = function(server, options, next) {
  server.route({
    method: 'POST',
    path: '/update-msg',
    config: {
      pre: [sessionPre],
      handler: function(req, reply) {
        req.pre.session.msg = req.payload.msg;
        req.setSession(req.pre.session, function(err) {
          if (err) {
            return reply(err);
          }
          reply('session updated');
        });
      }
    }
  });

  next();
}
```


## License

MIT © [Zoltan Kochan](https://www.kochan.io)
