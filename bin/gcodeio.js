#!/usr/bin/env node

var skateboard = require('skateboard');

skateboard({
  dir: __dirname + '/../static',
  port: 9871
}, function(stream) {
  stream.pipe(process.stdout);
});
