var config = require('../config.json');
var s3 = require('steam-server-status');
var Q = require('q');

module.exports = {
  steamStatus: Q.promised(function () {
    return Q.nfcall(s3.getServerStatus, config.address, 27015);
  })
};
