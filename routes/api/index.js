const express = require('express');
const router = express.Router();

const api = require('../../lib/api');

const fs = require('fs');
const path = require('path');

const archiveFilename = genFilename();
const archivePathname = 'storage/upload';

const accountsFilename = 'accounts.json';
const dbPathname = 'storage/db';

const logPathname = 'readings/log';
const workPathname = 'readings/work';

fs.mkdirSync(path.resolve(process.root, dbPathname, logPathname), {recursive: true});
fs.mkdirSync(path.resolve(process.root, dbPathname, workPathname), {recursive: true});


router.get('/v1.0/accounts', function (req, res, next) {
  const {token, period} = req.query;
  if (token !== process.env.TOKEN) return res.sendStatus(401);
  if (!/^\d{6}$/.test(period)) return res.status(400).send(`Error in param "period=${period}"`);

  (async ()=>{
    const result = await api.getReadings(period);
    res.json(result);
  })().catch(err=>next(err))
})

router.put('/v1.0/reading', function (req, res, next) {
  const {account, meter, reading} = req.query;
  if (!account || !meter || !reading) return res.status(400).send("Query MUST contain params: account, meter, reading");

  (async ()=>{
    const dbFile = path.resolve(process.root, dbPathname, accountsFilename);
    const db = JSON.parse(await fs.promises.readFile(dbFile, 'utf-8'));
  
    if (!db[account]) return res.status(404).send(`Account "${account}" is not found`);
  
    const meters = db[account].meters;
    if (!meters || !meters[meter]) return res.sendStatus(404);

    await api.putReading(account, meter, new Date(), req.ip, req.headers['user-agent'], reading); 
    res.sendStatus(200);
  })().catch(err=>next(err));
})

router.get('/v1.0/check', function (req, res, next) {
  const dbFile = path.resolve(process.root, dbPathname, accountsFilename);
  const {account: accountToCheck, meter: meterToCheck} = req.query;
  (async ()=> {
    const db = JSON.parse(await fs.promises.readFile(dbFile, 'utf-8'));

    const account = db[accountToCheck];
    if (!account) return res.sendStatus(404);
    if (!meterToCheck) return res.json({});

    const meters = account.meters;
    if (!meters || !meters[meterToCheck]) return res.sendStatus(404);

    const meter = meters[meterToCheck];
    return res.json(meter);
  })().catch(err=>next(err));
});

router.put('/v1.0/accounts', function(req, res, next) {
  const {token} = req.query;
  if (token !== process.env.TOKEN) return res.sendStatus(401);

  const data = JSON.stringify(req.body);

  const saveFile = async (pathname, filename, data) => {
    await fs.promises.mkdir(pathname, {recursive: true});
    await fs.promises.writeFile(path.resolve(process.root, pathname, filename), data);
  }

  (async ()=> {
    await Promise.all([
      saveFile(archivePathname, archiveFilename, data), 
      saveFile(dbPathname, accountsFilename, data)
    ]);
    res.sendStatus(200);
  })().catch(err=>next(err));
});

router.get('/v1.0/check', function(req, res, next) {
  const {account, meter} = req.query;
  
  res.json({api: "000", ...{account, meter}});
});

router.get('/v1.0', function(req, res, next) {
  res.json({api: "ok"});
});

function genFilename() {
  return (new Date()).toISOString().replace(/\D/g, "") + '.json';
}

function getPeriod(datetime) {
  const year = datetime.getFullYear();
  const month = datetime.getMonth() + 1;
  return `${year}${month}`;
}

function getSafeFileName(str) {
  return str.replace(/[^a-z0-9]/gi, '_').toLowerCase();
}

function getReadingWorkDir(account, meter) {
  const accountDir = getSafeFileName(account);
  const meterDir = getSafeFileName(meter);
  const workPathToDir = path.resolve(process.root, dbPathname, workPathname, accountDir, meterDir);

  return workPathToDir;
};

module.exports = router;
