"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = quit;

var _pg = require("pg");

// Schedule immediate termination (as soon as all active sessions
// call `.exit`). This is not the normal behavior as the pool normally
// stays open so a future `.begin` can acquire the connection. This is
// quite useful in scratch scripting though.
function quit() {
  return new Promise(function (resolve) {
    _pg.native.on("end", resolve);
    _pg.native.end();
  });
}