'use strict';
module.exports = {
  assign: 'session',
  method: function(req, reply) {
    req.getSession(function(err, session) {
      if (err) {
        throw err
      }
      reply(session)
    })
  },
}
