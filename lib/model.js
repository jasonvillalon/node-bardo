"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _sqlBricksPostgres = require("sql-bricks-postgres");

var _sqlBricksPostgres2 = _interopRequireDefault(_sqlBricksPostgres);

var _db = require("./db");

var _db2 = _interopRequireDefault(_db);

var _util = require("./util");

var _util2 = _interopRequireDefault(_util);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

let Model = function () {
  function Model() {
    _classCallCheck(this, Model);
  }

  _createClass(Model, null, [{
    key: "serialize",
    value: function serialize(row) {
      return _util2.default.serialize(row);
    }
    // NOTE: Must be defined by the derived class

  }, {
    key: "deserialize",
    value: function deserialize(item) {
      return _util2.default.deserialize(item);
    }
  }, {
    key: "read",
    value: function read() {
      if (this.table == null) {
        throw new Error(`${ this.name }.table must be defined`);
      }

      return _sqlBricksPostgres2.default.select("*").from(this.table);
    }

    /**
     * Get a single model instance; identified by the primaryKey (id).
     */

  }, {
    key: "one",
    value: function one(id) {
      return new Promise((resolve, reject) => {
        // Build the SQL statement (and attach a `WHERE` for the id)
        let stmt = this.read().where({ id: id });

        // Execute the statement
        _db2.default.execute(stmt).then(rows => {
          // Return the result
          resolve(this.serialize(rows[0]));
        }).catch(reject);
      });
    }

    /**
     * Get all rows (as model instances).
     */

  }, {
    key: "all",
    value: function all() {
      return new Promise((resolve, reject) => {
        // Build the SQL statement
        let stmt = this.read();

        // Execute the statement
        _db2.default.execute(stmt).then(rows => {
          // Return the result
          resolve(rows.map(this.serialize));
        }).catch(reject);
      });
    }

    /**
     * Create a new model instance from the given values.
     */

  }, {
    key: "create",
    value: function create(item) {
      if (this.table == null) {
        throw new Error(`${ this.name }.table must be defined`);
      }

      return new Promise((resolve, reject) => {
        // Build the SQL statement
        let values = this.deserialize(item);
        let stmt = _sqlBricksPostgres2.default.insert(this.table).values(values).returning("*");

        // Execute the statement
        _db2.default.execute(stmt).then(rows => {
          // Return the result
          resolve(this.serialize(rows[0]));
        }).catch(reject);
      });
    }

    /**
     * Update a model instance from the given values.
     */

  }, {
    key: "update",
    value: function update(id, item) {
      if (this.table == null) {
        throw new Error(`${ this.name }.table must be defined`);
      }

      return new Promise((resolve, reject) => {
        // Build the SQL statement (and attach a `WHERE` for the id)
        let values = this.deserialize(item);
        let stmt = _sqlBricksPostgres2.default.update(this.table, values).where({ id: id }).returning("*");

        // Execute the statement
        _db2.default.execute(stmt).then(rows => {
          // Return the result
          resolve(this.serialize(rows[0]));
        }).catch(reject);
      });
    }

    /**
     * Delete a single row; identified by the primaryKey (id).
     */

  }, {
    key: "destroy",
    value: function destroy(id) {
      if (this.table == null) {
        throw new Error(`${ this.name }.table must be defined`);
      }

      // Build the SQL statement (and attach a `WHERE` for the id)
      let stmt = _sqlBricksPostgres2.default.deleteFrom(this.table).where({ id: id });

      return new Promise(function (resolve, reject) {
        // Execute the statement
        _db2.default.execute(stmt).then(function (result) {
          resolve(result > 0);
        }).catch(reject);
      });
    }
  }]);

  return Model;
}();

Model.table = null;
exports.default = Model;