const test = require('ava');
const fs = require('fs-extra');
const path = require('path');

const { createFileWatcher } = require('../index.js');

test.afterEach(t => {
  fs.removeSync('./tests/watcher');
});

test.cb('works', t =>  {
  fs.ensureDirSync('./tests/watcher');

  createFileWatcher('./tests/watcher')
    .then(async watcher => {
      watcher.on('delete', file => {
        t.end();
        watcher.stop();
      });

      watcher.on('update', file => {
        t.pass();
        fs.removeSync(file);
      });

      await fs.ensureFile('./tests/watcher/foo.js');
    });
});

test.cb('ignore', t =>  {
  fs.ensureDirSync('./tests/watcher');

  t.plan(1);

  createFileWatcher('./tests/watcher', [ 'foo.js' ])
    .then(async watcher => {
      // will only fire once
      watcher.on('update', file => {
        t.truthy(/bar/.test(file));
        t.end();
        watcher.stop();
      });

      await fs.ensureFile('./tests/watcher/foo.js');
      await fs.ensureFile('./tests/watcher/bar.js');
    });
});
