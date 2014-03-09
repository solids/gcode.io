var skateboard = require('skateboard');

function SimulateMode(editor) {
  this.editor = editor;
}

SimulateMode.prototype.activate = function(last, options) {
  this.gcode = options.gcode;
  this.mesh = options.mesh;

//  this.skateboard = skateboard('ws://localhost:7008');



};

SimulateMode.prototype.mousedown = function(event) {
};

SimulateMode.prototype.keydown = function(event) {
  if (event.keyCode === 13) {
    this.exit && this.exit(this.gcode);
  }
}

SimulateMode.prototype.handle = function(type, event) {
  if (typeof this[type] === 'function') {
    return this[type](event);
  }
};

module.exports = SimulateMode;
