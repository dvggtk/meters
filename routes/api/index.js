const express = require('express');
const router = express.Router();

const fs = require('fs');
const path = require('path');

const archiveFilename = genFilename();
const archivePathname = 'storage/upload';

const workFilename = 'accounts.json';
const workPathname = 'storage/db';

router.get('/v1.0/check', function (req, res, next) {
  const dbFile = path.resolve(process.root, workPathname, workFilename);
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
      saveFile(workPathname, workFilename, data)
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

module.exports = router;