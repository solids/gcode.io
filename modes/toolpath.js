var workerstream = require('workerstream');


function ToolpathMode(editor) {
  this.editor = editor;
  var worker = workerify './../lib/toolpath-worker.js';
  this.worker = workerstream(worker);

  window.worker=  this.worker;
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
  var modelScale = 100;

  var lineMaterial = new THREE.LineBasicMaterial({
    color: 0xFF9D40,
    opacity: 1,
    linewidth: 1
  });

  this.worker.on('error', function(err) {
    console.error(err);
  });

  this.worker.on('data', function(data) {


    if (data.name === 'layer') {
      console.log(data.data.z, !!data.data.hulls)

      if (!data.data.hulls) {
        return;
      }



      var z = data.data.z;
      var hulls = data.data.hulls, l = hulls.length, lastGeometry;

      for (var i=0; i<hulls.length; i++) {
        var hullArray = hulls[i];
        if (hullArray && hullArray.length) {
          for (var j = 0; j<hullArray.length; j++) {
            var r = hullArray[j];
            if (r.length) {
              var lineGeometry = new THREE.Geometry();
              for (var k = 0; k < r.length; k++) {

                lineGeometry.vertices.push(
                  new THREE.Vector3(
                    r[k].X/modelScale,
                    r[k].Y/modelScale,
                    z/modelScale
                  )
                );
              }

              lineGeometry.vertices.push(
                new THREE.Vector3(
                  r[0].X/modelScale,
                  r[0].Y/modelScale,
                  z/modelScale
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

    } else if (data.name === 'grind') {
      console.log(Date.now() - start);
    } else {
      //console.log(Date.now(), data);
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
  for (var i=0; i<geometry.faces.length; i++) {
    var face = geometry.faces[i];

    // TODO: apply the actual scale/orientation from the mesh.
    this.worker.write({
      name : 'face',
      data: [
        [verts[face.a].x*modelScale, verts[face.a].y*modelScale, verts[face.a].z*modelScale],
        [verts[face.b].x*modelScale, verts[face.b].y*modelScale, verts[face.b].z*modelScale],
        [verts[face.c].x*modelScale, verts[face.c].y*modelScale, verts[face.c].z*modelScale]
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
