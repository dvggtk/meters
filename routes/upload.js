var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.render('upload', { title: 'Загрузка базы данных' });
});

router.post('/', function(req, res, next) {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send('No files were uploaded.');
  }

  console.log(req.files);
  // const str = req.files.db.data.toString('utf-8');
  // console.log(str);

  res.json({headers: req.headers});
});


module.exports = router;
