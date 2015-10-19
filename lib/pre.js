'use strict';

module.exports = {
  assign: 'session',
  method: function(req, reply) {
    req.getSession(reply);
  }
};
