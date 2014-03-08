var tools = require('editor3-meshtools');

function SelectFaceMode(editor) {
  this.helper = null;
  this.editor = editor;

  this.selectedMaterial = new THREE.MeshBasicMaterial({
    color: 0xFF9D40,
    transparent: true,
    opacity: 1,
    shading: THREE.FlatShading
  });
}

SelectFaceMode.prototype.activate = function(last, mesh) {
  this.mesh = mesh;
};

SelectFaceMode.prototype.deactivate = function() {
  if (this.helper) {
    this.helper.visible = false;
    this.helper.selected = false;
    this.helper.material = this.helper.originalMaterial;

    // var h = this.helper;
    // var p = h.position.clone().add(h.parent.position);
    // var d = h.position.clone().sub(h.parent.position);
    // var ax = p.angleTo(new THREE.Vector3(1, 0, 0));
    // var ay = p.angleTo(new THREE.Vector3(0, 1, 0));

    // if (ax > ay) {
    //   this.helper.parent.rotateX(ax);
    //   this.helper.parent.position.z += (this.helper.parent.geometry.boundingBox.max.x - this.helper.parent.geometry.boundingBox.min.x)/2;
    // } else {
    //   this.helper.parent.rotateY(ay);
    //   this.helper.parent.position.z += (this.helper.parent.geometry.boundingBox.max.y - this.helper.parent.geometry.boundingBox.min.y)/2;
    // }

    // TODO: orient the face
    this.helper.parent.restOnOrigin();
  } else {
    this.mesh.restOnOrigin();

  }
}

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
      window.selectedFace = this.helper;
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
