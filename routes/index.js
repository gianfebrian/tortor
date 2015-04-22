var express = require('express');
var router = express.Router();

var fs = require('fs');
var util = require('util');

var WebTorrent = require('webtorrent');
var dlPath = './tmp';
var lsFile = dlPath + '/files.txt';

var mkpath = require('mkpath');
var prettySize = require('prettysize');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

router.post('/magnet', function(req, res, next) {
  var magnetUri = req.body.magnet || undefined;
  if (!magnetUri) res.json({
    msg: 'magnetUri is undefined'
  });

  var client = new WebTorrent();
  var filePaths = [];

  client.add(magnetUri, function(torrent) {
    torrent.files.forEach(function(file) {
      filePaths.push(file.path);
    });

    client.destroy(function(err) {
      res.render('index', {
        files: filePaths,
        magnet: magnetUri
      });
    });
  });
});

router.post('/download', function(req, res, next) {
  var magnetUri = req.body.magnet || undefined;
  if (!magnetUri) res.json({
    msg: 'magnetUri is undefined'
  });

  var client = new WebTorrent({
    storage: true
  });
  var filePaths = [];

  client.add(magnetUri, function(torrent) {
    res.send('Now downloading ' + req.body.filepath);
    console.log(magnetUri);
    setInterval(function() {
      console.log('Downloaded: %s, Speed: %s',
        prettySize(torrent.swarm.downloaded),
        prettySize(torrent.swarm.downloadSpeed()) + '/s');
    }, 10000);

    torrent.files.forEach(function(file) {
      if (file.path == req.body.filepath) {
        file.select();
        var path = util.format('%s/%s', dlPath, file.path.replace(file.name, ''));
        mkpath.sync(path);
        var source = file.createReadStream();
        var destination = fs.createWriteStream(util.format('%s/%s', path, file.name));
        source.pipe(destination);
      } else {
        file.deselect();
      }
    });
    torrent.swarm.on('wire', function(wire) {
      wire.on('download', function(bytes) {
        console.log(bytes);
      });
    })
  });
});

module.exports = router;
