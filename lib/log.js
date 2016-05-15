"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _config = require("./config");

var _config2 = _interopRequireDefault(_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = require("simple-bunyan")(_config2.default.get("name").toLowerCase(), _config2.default.get("log"));