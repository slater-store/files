const test = require('ava');
const fs = require('fs-extra');
const path = require('path');

const { createFileManager } = require('../index.js');

test.afterEach(t => {
  fs.removeSync('./tests/manager');
  fs.removeSync('./tests/manager-build');
});

test.cb('works', t =>  {
  fs.ensureDirSync('./tests/manager');

  createFileManager({
    in: './tests/manager',
    out: './tests/manager-build',
  })
    .then(async manager => {
      manager.on('delete', file => {
        t.end();
        manager.stop();
      });

      manager.on('copy', file => {
        t.pass();
        fs.removeSync('./tests/manager/snippets/header.liquid');
      });

      await fs.ensureFile('./tests/manager/snippets/header.liquid');
    });
});
