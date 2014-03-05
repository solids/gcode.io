var tools = require('editor3-meshtools');

function ToolpathMode(editor) {
  this.editor = editor;
}

ToolpathMode.prototype.activate = function(mesh) {
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
