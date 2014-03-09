var skateboard = require('skateboard');


function SendToGrblMode(editor) {
  this.editor = editor;
}

SendToGrblMode.prototype.activate = function(last, options) {
  if (!options || !options.gcode) {
    return;
  }


  if (!this.skateboard) {
    skateboard('ws://localhost:7007', function(stream) {
      console.log('connected');
      stream.on('data', function(d) {
        console.log(d)
      });
      console.log(options.gcode.join('\n'));
      stream.write(options.gcode.join('\n') + '\n');
    });
  }

};

SendToGrblMode.prototype.mousedown = function(event) {

};


SendToGrblMode.prototype.keydown = function(event) {
  if (event.keyCode === 13) {
    this.exit && this.exit(this.helper);
  }
}

SendToGrblMode.prototype.handle = function(type, event) {
  if (typeof this[type] === 'function') {
    return this[type](event);
  }
};

module.exports = SendToGrblMode;
