var Editor3 = require('editor3');
var ModeManager = require('modemanager');
var OrbitControls = require('./lib/orbitcontrols')
var HelperMode = require('./modes/helper');
var SelectFaceMode = require('./modes/select-face');
var UploadMode = require('./modes/upload');
var tools = require('editor3-meshtools');

require('domready')(function() {

  var rootModeManager = new ModeManager(true);

  var editor = window.editor =  new Editor3('#select-bottom .context');
  editor.updateSteps.push(rootModeManager.update.bind(rootModeManager));

  rootModeManager.add('editor3', editor.modeManager);

  var uploadMode = new UploadMode(rootModeManager, document.getElementById('stl-drop-target'))

  // Setup editor3 controls
  editor.modeManager.add(
    'navigation',
    new OrbitControls(editor.scene, editor.camera),
    true
  );

  editor.modeManager.add('select-bottom', new SelectFaceMode(editor));

  editor.modeManager.modes['select-bottom'].exit = function(ngonHelper) {
    // TODO: store the ngon helper dimensions
    console.log('TODO: reorient the object and move to stock')
  };

  uploadMode.exit = function() {
    rootModeManager.mode('editor3');
    editor.modeManager.mode('select-bottom');
  };

  rootModeManager.add('upload', uploadMode);
  rootModeManager.mode('upload', editor);
});

