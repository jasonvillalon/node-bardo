"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = end;

var _log = require("../log");

var _log2 = _interopRequireDefault(_log);

var _execute = require("./execute");

var _execute2 = _interopRequireDefault(_execute);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// End the current session and release the acquired connection
// to the connection pool.
function end() {
  let d = process.domain;
  if (d == null || d.context == null || d.context.bardo == null) {
    // TODO: Report an error that we weren't in an active session
    return null;
  }

  return new Promise(function (resolve, reject) {
    function next() {
      // Release our client from the pool
      d.context.bardo.done();

      // DEBUG: Report total SQL execution time for this session
      var _d$context$bardo = d.context.bardo;
      let id = _d$context$bardo.id;
      let elapsed = _d$context$bardo.elapsed;
      let count = _d$context$bardo.count;

      elapsed = elapsed.toFixed(2);
      if (count > 0) {
        _log2.default.debug({ id: id, elapsed: `${ elapsed }ms`, count: count }, `${ count } statement${ count > 1 ? "s" : "" } executed in ${ elapsed }ms`);
      }

      // Remove us from the domain
      delete d.context.bardo;

      // Leave our domain
      d.exit();
      resolve();
    }

    // If we are currently in a transaction; rollback the transaction
    if (d.context.bardo.inTransaction) {
      (0, _execute2.default)("ROLLBACK").then(next).catch(reject);
    } else {
      next();
    }
  });
}