"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _fs = require("fs");

var _fs2 = _interopRequireDefault(_fs);

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// TODO: There has got to be an easier way to do this


let index = {};

for (let filename of _fs2.default.readdirSync(__dirname)) {
  var _path$parse = _path2.default.parse(filename);

  let name = _path$parse.name;
  let ext = _path$parse.ext;

  if (ext === ".js" && name !== "index") {
    index[name] = require(`./${ name }`).default;
  }
}

exports.default = index;