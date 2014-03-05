function StockMode(editor) {
  this.editor = editor;
}

StockMode.prototype.activate = function(last, mesh) {


};

StockMode.prototype.mousedown = function(event) {
};


StockMode.prototype.keydown = function(event) {
  if (event.keyCode === 13) {
    this.exit && this.exit(this.helper);
  }
}

StockMode.prototype.handle = function(type, event) {
  if (typeof this[type] === 'function') {
    return this[type](event);
  }
};

module.exports = StockMode;
