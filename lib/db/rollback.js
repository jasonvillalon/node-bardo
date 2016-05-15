"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = rollback;

var _execute = require("./execute");

var _execute2 = _interopRequireDefault(_execute);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function rollback() {
  return (0, _execute2.default)("ROLLBACK");
}