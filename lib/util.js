"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.serialize = serialize;
exports.deserialize = deserialize;

var _lodash = require("lodash");

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Transform from `addr__name_id` to `addr.nameId`
// TODO: Memoize to improve performance
function serialize(row) {
  if (row == null) return null;
  return _lodash2.default.transform(row, function (result, value, key) {
    let segments = key.split("__");
    let record = result;

    for (let seg of segments.slice(0, segments.length - 1)) {
      let name = _lodash2.default.camelCase(seg);

      if (record[name] == null) {
        record[name] = {};
      }

      record = record[name];
    }

    let name = _lodash2.default.camelCase(segments[segments.length - 1]);
    record[name] = row[key];
  });
}

// Transform from `addr.nameId` to `addr__name_id`
// TODO: Memoize to improve performance
function deserialize(item) {
  if (item == null) return null;

  let row = {};

  function clean(value) {
    if (value instanceof require("buffer").Buffer) {
      // Buffers need to be encoded
      value = "\\x" + value.toString("hex");
    }

    return value;
  }

  function expand(obj, prefix) {
    _lodash2.default.each(obj, function (value, key) {
      let text = _lodash2.default.snakeCase(key);
      let name = prefix ? prefix + "__" + text : text;
      if (_lodash2.default.isPlainObject(value)) {
        expand(value, name);
      } else {
        row[name] = clean(value, name);
      }
    });
  }

  expand(item, null);

  return row;
}

exports.default = {
  serialize: serialize,
  deserialize: deserialize
};