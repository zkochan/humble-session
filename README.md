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

## Usage

Register the plugin:

```js
var Hapi = require('hapi');
var humbleSession = require('humble-session');

var server = new Hapi.Server();

server.register(humbleSession, function(err) {
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
        req.setSession(req.pre.session);
        reply('session updated');
      }
    }
  });

  next();
}
```


## License

MIT
