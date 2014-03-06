var slicer = new (require('mesh-slice-polygon'))();
var huller = new (require('hullworks'))();

var config = {
  stepover : 1, // 100% stepover (not a great finish)
  toolDiameter : 10,
  depth: 1, // 1 mm per layer
  stocktop: 10
};

var handlers = {};


handlers.configure = function(data) {
  Object.keys(data).forEach(function(key) {
    config[key] = data[key];
  });
  self.postMessage({ name: 'config', data: config });
};

handlers.face = function(verts) {
  // TODO: error checking
  slicer.addTriangle(verts);
};

handlers.grind = function() {
  self.postMessage({
    name: 'log',
    data: ['from', config.stocktop, 'to', 0].join(' ')
  });

  var amount = config.stepover * config.toolDiameter;
  var z = config.stocktop;
  while (z) {



    var hulls = slicer.slice(z);
    if (hulls) {
      slicer.markHoles(hulls);

      var offsetHulls = huller.offset(hulls, amount);
      if (offsetHulls) {
        self.postMessage({
          name : 'layer',
          data : {
            hulls: offsetHulls,
            z : z
          }
        });
      }
    }

    z -= config.depth;

    if (z < config.depth/2 && z > -config.depth/2) {
      z = 0.01;
    } else if (z < 0) {
      break;
    }

  }

  self.postMessage({ name : 'grind' });
};

self.onmessage = function(event) {
  if (event.data.name && handlers[event.data.name]) {
    handlers[event.data.name](event.data.data);
  } else {
    self.postMessage({ error : 'invalid handler "' + event.data.name + '"' });
  }
};