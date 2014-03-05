
function ToolpathMode(editor) {
  this.editor = editor;
  this.worker = workerify './../lib/toolpath-worker.js';
}

ToolpathMode.prototype.activate = function(last, mesh) {
  var h1 = this.editor.parentElement.querySelector('h1');
  h1.innerHTML = "let's generate toolpaths"
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
