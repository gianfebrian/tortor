var express = require('express');
var router = express.Router();

var fs = require('fs');
var util = require('util');

var WebTorrent = require('webtorrent');
var dlPath = '/tmp';

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

router.post('/download', function(req, res, next) {
  var magnetUri = req.body.magnet || undefined;
  if (!magnetUri) res.json({ msg: 'magnetUri is undefined'});

  var client = new WebTorrent();
  var filePaths = [];

  client.add(magnetUri, function(torrent) {
    torrent.files.forEach(function(file) {
      filePaths.push(file.path);
      fs.appendFileSync('../tmp/files.txt', file.path);
      var source = file.createReadStream();
      var destination = fs.createWriteStream(util.format('%s/%s', dlPath, file.path));
      source.pipe(destination);
    });

    res.json({ msg: 'Now Downloading', path: filePaths });
  });
});

module.exports = router;
