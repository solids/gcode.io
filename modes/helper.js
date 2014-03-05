var tools = require('editor3-meshtools');

function HelperMode(sceneObject, camera) {
  this.helper = null;
  this.sceneObject = sceneObject;
  this.camera = camera;
}

HelperMode.prototype.mousemove = function(event) {

  var isect = tools.mouseNgonHelperIntersection(
    this.sceneObject,
    this.camera,
    new THREE.Vector2(event.offsetX, event.offsetY)
  );

  if (this.helper) {
    this.helper.visible = false;
  }

  if (isect && isect.face) {
    if (isect.face.ngonHelper) {
      this.helper = isect.face.ngonHelper;
      this.helper.visible = true;
      return true;
    /* TODO: find the closest line and if the user is hovering, highlight it
    } else {

      var lineGeometry = new THREE.Geometry();
      lineGeometry.vertices.push(new THREE.Vector3(0, 10, 0));
      lineGeometry.vertices.push(new THREE.Vector3(10, 0, 0));

      lineGeometry.vertices[0] = isect.object.geometry.vertices[isect.face.a].clone().add(isect.object.position);
      lineGeometry.vertices[1] = isect.object.geometry.vertices[isect.face.b].clone().add(isect.object.position);

      var lineMaterial = new THREE.LineBasicMaterial({
        color: 0xffffff
      });

      var line = new THREE.Line(lineGeometry, lineMaterial);
      test.add(line);
    */
    }
  }
};


HelperMode.prototype.mouseup = HelperMode.prototype.mousemove;
HelperMode.prototype.mousedown = HelperMode.prototype.mousemove;


HelperMode.prototype.handle = function(type, event) {
  if (typeof this[type] === 'function') {
    return this[type](event);
  }
};


module.exports = HelperMode;
