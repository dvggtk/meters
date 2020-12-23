const fs = require('fs');
const path = require('path');

const accountsFilename = 'accounts.json';
const dbPathname = 'storage/db';

const logPathname = 'readings/log';
const workPathname = 'readings/work';

fs.mkdirSync(path.resolve(process.root, dbPathname, logPathname), {recursive: true});
fs.mkdirSync(path.resolve(process.root, dbPathname, workPathname), {recursive: true});

async function getReadings(period) {
  const dbFile = path.resolve(process.root, dbPathname, accountsFilename);
  const db = JSON.parse(await fs.promises.readFile(dbFile, 'utf-8'));

  // Асинхронное чтение всех файлов с показаниями счетчиков
  // хз, как это понять, когда вернусь сюда
  const accounts = Object.keys(db);
  const result = (await Promise.all(accounts.map(account => {
    return (async ()=>{
      const meters = Object.keys(db[account].meters);
      const currentReadings = await Promise.all(meters.map(meter => {
        return (async ()=>{
          const readingWorkDir = getReadingWorkDir(account, meter);
          const currentPeriodFilename = period + '.json';

          let currentReading;
          
          try {
            currentReading = JSON.parse(await fs.promises.readFile(path.resolve(readingWorkDir, currentPeriodFilename), 'utf-8'));
            console.log(currentReading);
          } catch (err) {
            if (err.code !== 'ENOENT') throw err;
            currentReading = null;
          }

          if (currentReading !== null 
            && (account !== currentReading.account || meter !== currentReading.meter)) {
            throw Error(`Consistency error in file "${currentPeriodFilename}"`);
          }

          return currentReading;
        })();
      }));

      return currentReadings;
    })();
  })))
  .flat()
  .filter(_ => _ !== null);

  return result;
}

async function putReading (account, meter, datetime, ip, userAgent, reading) {
  const data = JSON.stringify({account, meter, timestamp: datetime.getTime(), ip, "user-agent": userAgent, source: "web", reading});

  const periodFilename = getPeriod(datetime) + '.json';
  const logFilename = genFilename();

  const accountDir = getSafeFileName(account);
  const meterDir = getSafeFileName(meter);

  const logFullpath = path.resolve(process.root, dbPathname, logPathname, accountDir, meterDir, logFilename);
  const workFullpath = path.resolve(getReadingWorkDir(account, meter), periodFilename);

  await Promise.all([
    fs.promises.mkdir(path.dirname(workFullpath), {recursive: true}), 
    fs.promises.mkdir(path.dirname(logFullpath), {recursive: true})
  ]);

  await Promise.all([
    fs.promises.writeFile(logFullpath, data, 'utf-8'),
    fs.promises.writeFile(workFullpath, data, 'utf-8')
  ])
}

function getReadingWorkDir(account, meter) {
  const accountDir = getSafeFileName(account);
  const meterDir = getSafeFileName(meter);
  const workPathToDir = path.resolve(process.root, dbPathname, workPathname, accountDir, meterDir);

  return workPathToDir;
};

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

module.exports = {getReadings, putReading, getPeriod}
