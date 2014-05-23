var workerstream = require('workerstream');
var Vec2 = require('vec2');
var tincture = require('tincture');


function ToolpathMode(editor) {
  this.editor = editor;
  var worker = workerify './../lib/toolpath-worker.js';
  this.worker = workerstream(worker);

  var gcode = function(op, obj) {
    return op + ' ' +  Object.keys(obj).map(function(n) {
      var nl = n.toLowerCase();
      if (nl !== 'x' && nl !== 'y' && nl !== 'z' && nl !== 'f') {
        return;
      }

      var val = Number(obj[n]).toFixed(3);
      if (nl === 'x') {
        val -= mode.bb[0][0];
        val += mode.form.toolDiameter()/2;
      }

      if (nl === 'y') {
        val -= mode.bb[0][1];
        val += mode.form.toolDiameter()/2;
      }

      return n.toUpperCase() + val;
    }).filter(Boolean).join(' ');
  };


  var lineMaterial = new THREE.LineBasicMaterial({
    color: 0xFF9D40,
    opacity: 1,
    linewidth: 2
  });

  this.worker.on('error', function(err) {
    console.error(err);
  });

  var mode = this;
  this.worker.on('data', function(data) {
    if (data.name === 'log') {
      console.log(data.data);
    } else if (data.name === 'layer') {

      if (!data.data.hulls) {
        return;
      }

      var layer = [];

      var z = data.data.z/mode.modelScale;
      var hulls = data.data.hulls, l = hulls.length, lastGeometry;

      for (var i=0; i<hulls.length; i++) {
        var hullArray = hulls[i];

        if (hullArray && hullArray.length) {
          for (var j = 0; j<hullArray.length; j++) {

            var r = hullArray[j];
            if (r.length) {

              var lineGeometry = new THREE.Geometry();
              for (var k = 0; k < r.length; k++) {

                r[k].X /= mode.modelScale;
                r[k].Y /= mode.modelScale;

                mode.gcode.push(gcode('G1', r[k]));

                if (k === 0) {
                  mode.gcode.push(gcode('G1', {
                    z : -(mode.boundZ - z)
                  }));
                }

                lineGeometry.vertices.push(
                  new THREE.Vector3(r[k].X, r[k].Y, z)
                );
              }

              mode.gcode.push(gcode('G1', r[0]));
              mode.gcode.push(gcode('G1', { z : 5 }));

              lineGeometry.vertices.push(
                new THREE.Vector3(r[0].X, r[0].Y, z)
              );

              mode.toolPathDisplay.add(new THREE.Line(
                lineGeometry,
                lineMaterial,
                THREE.LineStrip
              ));
            }
          }
        }
      }

      mode.gcode.push(gcode('G1', { z : 5 }));

    } else if (data.name === 'grind') {
      console.log('elapsed', (Date.now() - mode.grindStart) + 'ms');

      Array.prototype.push.apply(mode.gcode, [
        'G1 Z' + Math.abs(mode.startZ || 5),
        'G4 P2',
        'M5',
        '$H',
        'G10 L20 P1 X0 Y0 Z0',
        'G1 X5 Y5 Z-5'
      ]);

      console.log(mode.gcode.join('\n'));
    }
  });

  this.layers = [];

  this.form = tincture(
    editor.parentElement.querySelector('#toolpath-dialog')
  );

  var that = this, throttleTimer;
  var handlePropertyChange = function(name, current, old) {
    if (current === old) {
      return;
    }

    if (throttleTimer) {
      clearTimeout(throttleTimer);
    }

    throttleTimer = setTimeout(mode.generate.bind(mode), 200);
  };
  setTimeout(function() {
    var keys = Object.keys(mode.form);
    for (var i = 0; i<keys.length; i++) {
      var k = keys[i];
      var prop = mode.form[k];

      if (typeof prop === 'function') {
        mode.form[k].change(handlePropertyChange.bind(null, k));
      }
    }
  }, 200);
}

ToolpathMode.prototype.modelScale = 1000;

ToolpathMode.prototype.deactivate = function(last) {
  this.editor.parentElement.querySelector('#toolpath-dialog').style.display = 'none';
};

ToolpathMode.prototype.activate = function(last, mesh) {

  var h1 = this.editor.parentElement.querySelector('h1');
  h1.innerHTML = "let's generate toolpaths";
  this.mesh = mesh;

  this.editor.parentElement.querySelector('#toolpath-dialog').style.display = 'block';


  var modelScale = this.modelScale;

  var geometry = mesh.geometry;
  var verts = geometry.vertices;
  var mx = mesh.position.x;
  var my = mesh.position.y;
  var mz = mesh.position.z;
  for (var i=0; i<geometry.faces.length; i++) {
    var face = geometry.faces[i];

    // TODO: apply the actual scale/orientation from the mesh.
    this.worker.write({
      name : 'face',
      data: [
        [(mx + verts[face.a].x) * modelScale, (my + verts[face.a].y) * modelScale, (mz + verts[face.a].z) * modelScale],
        [(mx + verts[face.b].x) * modelScale, (my + verts[face.b].y) * modelScale, (mz + verts[face.b].z) * modelScale],
        [(mx + verts[face.c].x) * modelScale, (my + verts[face.c].y) * modelScale, (mz + verts[face.c].z) * modelScale]
      ]
    });
  }

  this.generate();
}

ToolpathMode.prototype.generate = function() {

  if (this.toolPathDisplay) {
    this.editor.scene.remove(this.toolPathDisplay);
  }

  if (!this.mesh || !this.form.depthPerPass()) {
    return;
  }

  this.toolPathDisplay = new THREE.Object3D();
  this.editor.scene.add(this.toolPathDisplay);

  this.gcode = [
    '$H',
    'M4 S' + 7000,
    'G4 P5',
    'G10 L20 P1 X0 Y0 Z0',
    'G21G17',
    'G1 X' + (this.startX || 10) + ' Y' + (this.startY || 10) + ' F4000',
    'G1 Z' + this.startZ,
    'G10 L20 P1 X0 Y0 Z0',
    'G28.1 X0 Y0 Z0',
    'G1 Z5'
  ];

  var editor = this.editor;
  var mode = this;
  var modelScale = this.modelScale;

  var bb = this.bb = mesh.boundingBox({ x: 0, y: 0, z: 0});

  this.boundZ = bb[1][2] - bb[0][2];
  var posZ = mesh.position.z;

  this.worker.write({
    name : 'configure',
    data : {
      toolDiameter: this.form.toolDiameter()*modelScale,
      stockTop: (posZ + (bb[1][2] - bb[0][2])/2)*modelScale,
      stockBottom: this.form.stockBottom() * modelScale,//(posZ + bb[0][2])*modelScale,
      depthPerPass: modelScale*this.form.depthPerPass()
    }
  });
  this.grindStart = Date.now();
  this.worker.write({ name : 'grind' });
};

ToolpathMode.prototype.keydown = function(event) {
  if (event.keyCode === 13) {
    this.exit && this.exit(this.gcode, this.mesh);
  }
}

ToolpathMode.prototype.handle = function(type, event) {
  if (typeof this[type] === 'function') {
    return this[type](event);
  }
};

module.exports = ToolpathMode;
