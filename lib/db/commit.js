"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = commit;

var _execute = require("./execute");

var _execute2 = _interopRequireDefault(_execute);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function commit() {
  return (0, _execute2.default)("COMMIT");
}