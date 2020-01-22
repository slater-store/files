const chokidar = require('chokidar');
const onExit = require('exit-hook');
const mm = require('micromatch');
const junk = require('junk');

const { cleanPath } = require('@slater/util');

const cwd = process.cwd();

module.exports = async function createFileWatcher(dir = cwd, ignore = []) {
  const events = {};

  function emit(event, ...data) {
    (events[event] || []).map(cb => cb(...data));
  }

  const watcher = chokidar
    .watch(dir, {
      persistent: true,
      ignoreInitial: true,
      ignore,
    })
    .on('all', (event, path) => {
      if (!path) return

      const file = cleanPath(path);

      if (mm.contains(file, ignore)) return;
      if (junk.is(file)) return;

      if (event === 'add' || event === 'change') {
        emit('update', file)
      } else if (event === 'unlink') {
        emit('delete', file)
      }
    });

  await new Promise(r => watcher.on('ready', () => setTimeout(r, 100)));

  onExit(() => watcher.close());

  return {
    stop() {
      return watcher.close()
    },
    on(event, cb) {
      events[event] = (events[event] || []).concat(cb);
      return () => {
        events[event].splice(events[event].indexOf(cb), 1);
      };
    }
  }
}
