var slicer = new (require('mesh-slice-polygon'))();
var huller = new (require('hullworks'))();

var config = {
  stepover : 1, // 100% stepover (not a great finish)
  toolDiameter : 10,
  depthPerPass: 1, // 1 mm per layer
  stockTop: 10
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
  var steps = Math.floor((config.stockTop - config.stockBottom) / config.depthPerPass) + 1;

  self.postMessage({
    name: 'log',
    data: ['from', config.stockTop, 'to', config.stockBottom, '#', steps].join(' ')
  });

  var amount = config.stepover * (config.toolDiameter/2);
  var z = config.stockTop;

  while(steps--) {

    if (!steps) {
      z = config.stockBottom + .1;
    }

    var hulls = slicer.slice(z);
    self.postMessage({
      name: 'log',
      data : 'hulls=' + (hulls ? hulls.length : false)
    });

    var offsetHulls = null
    if (hulls) {
      slicer.markHoles(hulls);

      self.postMessage({

        name: 'log',
        data : 'marked'
      });

      offsetHulls = huller.offset(hulls, amount);
    }

    self.postMessage({
      name: 'log',
      data : 'z=' + z + ';steps=' + steps
    });

    self.postMessage({
      name : 'layer',
      data : {
        hulls: offsetHulls,
        z : z
      }
    });

    z -= config.depthPerPass;
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
