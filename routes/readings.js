var express = require('express');
var router = express.Router();

const api = require('../lib/api');

router.get('/', function(req, res, next) {
  let {period} = req.query;
  if (period && !/^\d{6}$/.test(period)) return res.status(400).send(`Error in param "period=${period}"`);
  if (!period) period = api.getPeriod(new Date());

  (async ()=>{
    const readings = await api.getReadings(period);

    res.render('readings', {period, readings});
  })().catch(err=>next(err));
});

module.exports = router;
