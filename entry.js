var Editor3 = require('editor3');
var ModeManager = require('modemanager');
var OrbitControls = require('./lib/orbitcontrols')
var HelperMode = require('./modes/helper');
var SelectFaceMode = require('./modes/select-face');
var UploadMode = require('./modes/upload');
var ToolpathMode = require('./modes/toolpath');
var tools = require('editor3-meshtools');

require('domready')(function() {

  var rootModeManager = new ModeManager(true);

  var editor = window.editor =  new Editor3('#editor3 .context', '#editor3');
  editor.updateSteps.push(rootModeManager.update.bind(rootModeManager));

  rootModeManager.add('editor3', editor.modeManager);

  var uploadMode = new UploadMode(rootModeManager, document.getElementById('stl-drop-target'))

  // Setup editor3 controls
  editor.modeManager.add(
    'navigation',
    new OrbitControls(editor.scene, editor.camera),
    true
  );

  // Toolpath generation
  editor.modeManager.add('toolpath', new ToolpathMode(editor));
  editor.modeManager.add('select-bottom', new SelectFaceMode(editor));


  var mesh = null;
  uploadMode.exit = function(uploadedMesh) {
    mesh = uploadedMesh;

    editor.parentElement.style.display = "block";
    editor.resize();

    rootModeManager.mode('editor3');
    editor.modeManager.mode('select-bottom');
  };


  editor.modeManager.modes['select-bottom'].exit = function(ngonHelper) {
    // TODO: store the ngon helper dimensions
    //console.log('TODO: reorient the object and move to stock')
    editor.modeManager.mode('toolpath', mesh)
  };


  rootModeManager.add('upload', uploadMode);
  rootModeManager.mode('upload', editor);
});

