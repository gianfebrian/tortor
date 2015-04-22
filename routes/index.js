var express = require('express');
var router = express.Router();

var fs = require('fs');
var util = require('util');

var WebTorrent = require('webtorrent');
var dlPath = 'tmp';
var lsFile = dlPath + '/files.txt';

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
      fs.appendFileSync(lsFile, file.path);
      var source = file.createReadStream();
      var destination = fs.createWriteStream(util.format('%s/%s', dlPath, file.name));
      source.pipe(destination);
    });

    res.json({ msg: 'Now Downloading', path: filePaths });
  });
});

module.exports = router;
