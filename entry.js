var Editor3 = require('editor3');
var ModeManager = require('modemanager');
var OrbitControls = require('./lib/orbitcontrols')


require('domready')(function() {

  var rootModeManager = new ModeManager(true);

  var editor = window.editor =  new Editor3('#select-bottom .context');
  editor.updateSteps.push(rootModeManager.update.bind(rootModeManager));

  rootModeManager.add('editor3', editor.modeManager);

  // Setup editor3 controls
  editor.modeManager.add(
    'navigation',
    new OrbitControls(editor.scene, editor.camera),
    true
  );

  // TODO: move this into a mode
  var dropTarget = document.getElementById('stl-drop-target');

  var dropper = require('drop-stl-to-json')(dropTarget);
  dropper.once('stream', function(stl) {

    var mesh = window.mesh = editor.createMesh();

    stl.once('data', function() {
      stl.on('data', function(obj) {
        mesh.addFace(obj.verts, obj.normal);
      });
    });

    stl.once('end', function() {
      mesh.finalize();
      editor.addMesh(mesh);
      mesh.material.opacity = .2;

      rootModeManager.mode('editor3');

      // TODO: zoom to fit the mesh!
      //editor.focusOn(mesh);

    });
  });
});

