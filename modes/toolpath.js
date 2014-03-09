var workerstream = require('workerstream');
var Vec2 = require('vec2');

function ToolpathMode(editor) {
  this.editor = editor;
  var worker = workerify './../lib/toolpath-worker.js';
  this.worker = workerstream(worker);

  window.worker=  this.worker;
  this.layers = [];
  this.gcode = [];
}

ToolpathMode.prototype.deactivate = function(last) {
};

ToolpathMode.prototype.activate = function(last, mesh) {
  var h1 = this.editor.parentElement.querySelector('h1');
  h1.innerHTML = "let's generate toolpaths";
  this.mesh = mesh;

  // TODO: interface for changing
  //  * depth per cut
  //  * tool diameter
  var editor = this.editor;
  var mode = this;
  var modelScale = 100;

  var lineMaterial = new THREE.LineBasicMaterial({
    color: 0xFF9D40,
    opacity: 1,
    linewidth: 1
  });

  this.worker.on('error', function(err) {
    console.error(err);
  });


  var gcode = function(op, obj) {
    return op + Object.keys(obj).map(function(n) {
      if (n !== 'x' && n !== 'y' && n !== 'z' && n !== 'f') {
        return;
      }

      return n.toUpperCase() + Number(obj[n]).toFixed(2);
    }).filter(Boolean).join(' ');
  };

  mesh.geometry.computeBoundingBox();
  var boundZ = mesh.geometry.boundingBox.max.z - mesh.geometry.boundingBox.min.z;
  console.log('TOP Z', boundZ);

  this.worker.on('data', function(data) {


    if (data.name === 'layer') {

      if (!data.data.hulls) {
        return;
      }


      var layer = [];


      var z = data.data.z/modelScale;
      var hulls = data.data.hulls, l = hulls.length, lastGeometry;

      for (var i=0; i<hulls.length; i++) {
        var points = [];
        var hullArray = hulls[i];
        if (hullArray && hullArray.length) {
          for (var j = 0; j<hullArray.length; j++) {
            var r = hullArray[j];
            if (r.length) {
              var lineGeometry = new THREE.Geometry();
              for (var k = 0; k < r.length; k++) {

                var v = new Vec2(r[k].X/modelScale, r[k].Y/modelScale);


                points.push(v);
                mode.gcode.push(gcode('G1', v));

                if (k === 0) {
                  mode.gcode.push(gcode('G1', {
                    z : -(boundZ - z)
                  }));
                }

                lineGeometry.vertices.push(
                  new THREE.Vector3(v.x, v.y, z)
                );
              }

              var v = new Vec2(r[0].X/modelScale, r[0].Y/modelScale);

              mode.gcode.push(gcode('G1', v));

              if (k === 0) {
                mode.gcode.push(gcode('G1', { z : 5 }));
              }

              lineGeometry.vertices.push(
                new THREE.Vector3(
                  v.x,
                  v.y,
                  z
                )
              );

              editor.scene.add(new THREE.Line(
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
      console.log('elapsed', (Date.now() - start) + 'ms');
    }
  });

  var geometry = mesh.geometry;

  this.worker.write({
    name : 'configure',
    data : {
      toolDiameter: modelScale ,
      // Dodge a slight issue with mesh-slice-polygon
      stocktop: geometry.boundingBox.max.z*modelScale - .001,
      depth: (geometry.boundingBox.max.z*modelScale)/20
    }
  });

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

  var start = Date.now();
  this.worker.write({ name : 'grind' });
};

ToolpathMode.prototype.mousedown = function(event) {

};


ToolpathMode.prototype.keydown = function(event) {
  if (event.keyCode === 13) {
    this.exit && this.exit(this.helper);
  }
}

ToolpathMode.prototype.handle = function(type, event) {
  if (typeof this[type] === 'function') {
    return this[type](event);
  }
};

module.exports = ToolpathMode;
