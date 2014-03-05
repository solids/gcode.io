var tools = require('editor3-meshtools');

function SelectFaceMode(editor) {
  this.helper = null;
  this.editor = editor;

  this.selectedMaterial = new THREE.MeshBasicMaterial({
    color: 0xFF9D40,
    transparent: true,
    opacity: .7,
    shading: THREE.FlatShading
  });
}

SelectFaceMode.prototype.activate = function(event) {
  editor.container.parentElement.style.display = "block";
  editor.resize();
};

SelectFaceMode.prototype.mousedown = function(event) {

  var isect = tools.mouseNgonHelperIntersection(
    this.editor.scene,
    this.editor.camera,
    new THREE.Vector2(event.offsetX, event.offsetY)
  );

  if (isect && isect.face) {

    if (this.helper) {
      this.helper.visible = false;
      this.helper.selected = false;
      this.helper.material = this.helper.originalMaterial;
    }

    if (isect.face.ngonHelper) {
      this.helper = isect.face.ngonHelper;
      this.helper.originalMaterial = this.helper.material;
      this.helper.material = this.selectedMaterial;
      this.helper.visible = true;
      this.helper.selected = true;
    }
  }
};


SelectFaceMode.prototype.keydown = function(event) {
  if (event.keyCode === 13) {
    this.exit && this.exit(this.helper)
  }
}

SelectFaceMode.prototype.handle = function(type, event) {
  if (typeof this[type] === 'function') {
    return this[type](event);
  }
};

module.exports = SelectFaceMode;
