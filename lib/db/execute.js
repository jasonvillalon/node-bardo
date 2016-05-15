"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = execute;

var _lodash = require("lodash");

var _lodash2 = _interopRequireDefault(_lodash);

var _log = require("../log");

var _log2 = _interopRequireDefault(_log);

var _microtime = require("microtime");

var _microtime2 = _interopRequireDefault(_microtime);

var _config = require("../config");

var _config2 = _interopRequireDefault(_config);

var _begin = require("./begin");

var _begin2 = _interopRequireDefault(_begin);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Assert that we have a database context
function assertContext() {
  return new Promise(function (resolve, reject) {
    // Check if we're in an active session
    let d = process.domain;
    if (d == null || d.context == null || d.context.bardo == null) {
      // Begin the session before proceeding
      return (0, _begin2.default)().then(ctx => {
        resolve(ctx);
      }).catch(reject);
    }

    // Continue onwards with our active domain
    return resolve(d.context.bardo);
  });
}

function assertTransaction(ctx, statement) {
  return new Promise(function (resolve, reject) {
    if (/^begin/i.test(statement)) {
      // This statement is going to begin a transaction directly
      return resolve();
    }

    if (!ctx.inTransaction) {
      // We're not in a transaction; we should be
      return execute("BEGIN").then(resolve).catch(reject);
    }

    // Looks like everythign is good
    return resolve();
  });
}

// Actually execute the statement
function execute_(ctx, statement, values) {
  return new Promise(function (resolve, reject) {
    if (/^begin/i.test(statement)) {
      // If this is a `BEGIN` statement; put us in a transaction
      ctx.inTransaction = true;
    } else if (/^(commit|rollback)/i.test(statement)) {
      // Else if this is a `COMMIT` or `ROLLBACK` statement;
      // leave the transaction
      ctx.inTransaction = false;
    }

    // Default values to an empty array
    values = values || [];

    // TRACE: Get the current clock time
    let now = _microtime2.default.now();

    // Send the statement
    ctx.client.query(statement, values, function (err, result) {
      // Handle and reject if an error occurred
      if (err) return reject(err);

      // TRACE: Calculate the elasped time and log the SQL statement
      let elapsed = +((_microtime2.default.now() - now) / 1000).toFixed(2);
      _log2.default.trace({
        id: ctx.id,
        elapsed: `${ elapsed }ms`,
        values: values && values.length ? values : undefined
      }, statement);

      // DEBUG: Increment the per-session counters
      ctx.elapsed += elapsed;
      ctx.count += 1;

      // Parse (and resolve) the result proxy
      if (!_lodash2.default.isFinite(result.rowCount)) {
        // This doesn't support a sane row count resolve with nothing
        resolve();
      } else if (result.fields == null) {
        // Resolve the row count
        resolve(result.rowCount);
      } else {
        // Resolve the rows
        resolve(result.rows);
      }
    });
  });
}

function autoCommit(ctx, statement, result) {
  return new Promise((resolve, reject) => {
    if (_config2.default.get("autoCommit") && ctx.inTransaction) {
      if (!/^(begin)/i.test(statement)) {
        return execute("COMMIT").then(function () {
          resolve(result);
        }).catch(reject);
      }
    }

    return resolve(result);
  });
}

// TODO: Proper parsing of OID types into javscript equivalents
function execute(statement, values) {
  return new Promise(function (resolve, reject) {
    // Assert the database context
    return assertContext().then(function (ctx) {
      if (!(typeof statement === "string" || statement instanceof String)) {
        // The statement is not a string assuming that this is a prepared
        // statement from sql-bricks
        var params = statement.toParams();
        statement = params.text;
        values = params.values;
      }

      // Trim the statement
      statement = statement.trim();

      // Assert the transaction context
      return assertTransaction(ctx, statement).then(function () {
        // Execute the statement
        return execute_(ctx, statement, values).then(function (result) {
          return autoCommit(ctx, statement, result).then(resolve).catch(reject);
        }, reject);
      }).catch(reject);
    }).catch(reject);
  });
}