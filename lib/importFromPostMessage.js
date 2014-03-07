var through = require('through2');

module.exports = function importFromPostMessage() {

  if (window.opener) {
    console.log('was opened')

    window.opener.postMessage('ready', '*');

    var stream = through.obj(function(obj, enc, cb) {
      stream.push(obj);
      cb();
    });

    window.addEventListener('message', function(ev) {
      try {
        var data = JSON.parse(ev.data);
      } catch (e) {
        return;
      }

      switch (data.name) {
        case 'face':
          stream.write(data.data);
        break;

        case 'end':
          stream.end();
        break;
      }
    });

    return stream;
  }

  // ignore otherwise
};
