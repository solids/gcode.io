var dropHandler = require('drop-stl-to-json');
var tools = require('editor3-meshtools');

var postMessageImport = require('../lib/importFromPostMessage');

function UploadMode(modeManager, element) {
  this.modeManager = modeManager;
  this.element = element;
}

UploadMode.prototype.handleUploadStream = function(stream) {

  var mesh = window.mesh = editor.createMesh();
  var mode = this;

  stream.on('data', function(obj) {
    console.log('add', obj);
    mesh.addFace(obj.verts, obj.normal);
  });

  stream.once('end', function() {
    mesh.finalize();

    // TODO: compute this over the next X seconds, possibly in a webworker
    tools.computeNgonHelpers(mesh);

    editor.addMesh(mesh);

    // let the wiring take care of where we go from here.
    mode.exit(mesh);
  });
};

UploadMode.prototype.activate = function(last, editor) {

  var modeManager = this.modeManager;
  var mode = this;

  this.element.parentElement.style.display = "block"

  var stream = postMessageImport();
  if (stream) {
    mode.handleUploadStream(stream);
  } else {

    var dropper = dropHandler(this.element).once('stream', function(stl) {
      stl.once('data', function() {
        mode.handleUploadStream(stl);
      });
    });
  }
};

UploadMode.prototype.deactivate = function(event) {
  this.element.parentElement.style.display = "none"
};

UploadMode.prototype.handle = function(type, event) {
  console.log(type, event);
  if (typeof this[type] === 'function') {
    return this[type](event);
  }
};

module.exports = UploadMode;
