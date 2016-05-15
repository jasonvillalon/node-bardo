"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = truncate;

var _config = require("../config");

var _config2 = _interopRequireDefault(_config);

var _execute = require("./execute");

var _execute2 = _interopRequireDefault(_execute);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Cache of table names for a database name
var _tableNames = {};

function truncate(tables) {
  let callback = function (tables) {
    if (!tables || tables.length === 0) {
      return null;
    }

    var tableNames = tables.map(function (name) {
      return '"' + name + '"';
    }).join(", ");

    return (0, _execute2.default)("TRUNCATE " + tableNames + " RESTART IDENTITY CASCADE");
  };

  if (process.domain != null) {
    callback = process.domain.bind(callback);
  }

  if (!tables) {
    // No explicit list of tables was given
    // Do we have something cached?
    tables = _tableNames[_config2.default.get("name")];
    if (tables !== undefined) {
      return callback(tables);
    }

    // No cache query for all tables
    return (0, _execute2.default)("SELECT table_schema, table_name, table_type " + "FROM information_schema.tables").then(function (result) {
      tables = [];
      for (var i = 0; i < result.length; i += 1) {
        var row = result[i];

        if (row.table_type.toLowerCase() === "view") {
          continue;
        }

        if (["information_schema", "pg_catalog", "sql_features"].indexOf(row.table_schema) >= 0) {
          continue;
        }

        tables.push(row.table_name);
      }

      // Push this into the cache
      _tableNames[_config2.default.get("name")] = tables;

      // Continue
      return callback(tables);
    });
  }

  return callback(tables);
}