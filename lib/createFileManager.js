const path = require('path');
const fs = require('fs-extra');

const { getFileKey } = require('@slater/util');

const createFileWatcher = require('./createFileWatcher.js');

module.exports = async function createFileManager(config) {
  const events = {};

  function emit(event, ...data) {
    (events[event] || []).map(cb => cb(...data));
  }

  const watcher = await createFileWatcher(config.in, config.ignore);

  watcher.on('update', async file => {
    const key = getFileKey(file); // will return null if invalid file name
    if (!key) return;
    await fs.copy(file, path.join(config.out, key));
    emit('copy', key);
  });

  watcher.on('delete', async file => {
    const key = getFileKey(file);
    if (!key) return;
    await fs.remove(path.join(config.out, key));
    emit('delete', key);
  });

  return {
    stop() {
      return watcher.stop();
    },
    on(event, cb) {
      events[event] = (events[event] || []).concat(cb);
      return () => {
        events[event].splice(events[event].indexOf(cb), 1);
      };
    }
  };
}
