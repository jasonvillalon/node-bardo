"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = begin;

var _config = require("../config");

var _config2 = _interopRequireDefault(_config);

var _domain = require("domain");

var _domain2 = _interopRequireDefault(_domain);

var _shortid = require("shortid");

var _shortid2 = _interopRequireDefault(_shortid);

var _pg = require("pg");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function begin() {
  return new Promise(function (resolve, reject) {
    // If we are not in a domain we need to create a domain
    let d = _domain2.default.active;
    if (d == null) {
      d = _domain2.default.create();
    }

    // Explicitly run inside the domain
    d.run(next);

    function next() {
      d.enter();
      // Acquire the (possibly new) client from the pool
      _pg.native.connect({
        user: _config2.default.get("user"),
        password: _config2.default.get("password"),
        database: _config2.default.get("name"),
        port: _config2.default.get("port"),
        host: _config2.default.get("host")
      }, function (err, client, done) {
        if (err) return reject(err);

        // Initialize the domain context
        if (d.context == null) d.context = {};
        var ctx = {
          id: (0, _shortid2.default)(),
          client: client,
          done: done,
          count: 0,
          elapsed: 0
        };

        d.context.bardo = ctx;

        // Execute a "BEGIN" statement to begin the transaction
        return require("./execute").default("BEGIN").then(() => {
          resolve(ctx);
        }).catch(reject);
      });
    }
  });
}