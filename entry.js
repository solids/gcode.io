var Editor3 = require('editor3');

require('domready')(function() {

  // TODO: move this into a mode
  var dropTarget = document.getElementById('stl-drop-target');

  var dropper = require('drop-stl-to-json')(dropTarget);
  dropper.once('stream', function(stl) {
    var editor = window.editor =  new Editor3('#stl-drop-target');
    var mesh = window.mesh = editor.createMesh();

    stl.once('data', function() {
      stl.on('data', function(obj) {
        mesh.addFace(obj.verts, obj.normal);
      });
    });

    stl.once('end', function() {
      mesh.finalize();
      editor.addMesh(mesh);

      requestAnimationFrame(function tick() {
        editor.render();
        requestAnimationFrame(tick);
      });

      // TODO: zoom to fit the mesh!
      //editor.focusOn(mesh);

    });
  });
});
