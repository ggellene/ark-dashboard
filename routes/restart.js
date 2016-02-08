var express = require('express');
var router = express.Router();
var config = require('../config.json');
var service = require('../bin/svcUpstart.js');
var steamSvc = require('../bin/steam.js');
var assign = require('object-assign');

/* POST status. */
router.post('/', function (req, res, next) {
  var status = service.serviceStatus();
  var steam = steamSvc.steamStatus();
  Q.all([status, steam])
    .spread(function cbStatus(status, steam) {
      var resSvc = {};
      var stat = status.match(/ [\w\/]*/)[0];
      switch (stat) {
        case 'stopped/waiting':
          resSvc.status = 'stopped';
          break;
        case 'start/running':
          resSvc.status = 'running';
          break;
        case 'start/pre-start':
          resSvc.status = 'starting';
          break;
        case 'pre-stop/stopping':
          resSvc.status = 'stopping';
          break;
        default:
          resSvc.error = svc;
          break;
      }

      return assign(resSvc, steam);
    })
    .then(function cbRestart(result){
      if(!result.error && result.numberOfPlayers > 0){
        res.set(400).send('The server cannot be restarted while there are players connected. If a restart is needed you should coordinate with the other players.');
      }
      else{
        service.serviceStop()
          .then(service.serviceStart)
          .timeout(5000, '')
          .then(function cbStart(result){
            res.send(result);
          }, function ebStart(result){
            if(result === ''){
              res.send();
            }
            else{
              next(result);
            }
          });
      }
    })
    .catch(next);
});

module.exports = router;