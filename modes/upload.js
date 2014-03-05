var dropHandler = require('drop-stl-to-json');
var tools = require('editor3-meshtools');

function UploadMode(modeManager, element) {
  this.modeManager = modeManager;
  this.element = element;
}

UploadMode.prototype.activate = function(last, editor) {

  var modeManager = this.modeManager;
  var mode = this;

  this.element.parentElement.style.display = "block"

  var dropper = dropHandler(this.element).once('stream', function(stl) {

    var mesh = window.mesh = editor.createMesh();

    stl.once('data', function() {
      stl.on('data', function(obj) {
        mesh.addFace(obj.verts, obj.normal);
      });
    });

    stl.once('end', function() {
      mesh.finalize();

      // TODO: compute this over the next X seconds, possibly in a webworker
      tools.computeNgonHelpers(mesh);

      editor.addMesh(mesh);

      // let the wiring take care of where we go from here.
      mode.exit(mesh);
    });
  });
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
