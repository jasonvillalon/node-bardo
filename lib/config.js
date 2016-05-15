"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.get = get;
exports.has = has;
exports.configure = configure;

var _lodash = require("lodash");

var _lodash2 = _interopRequireDefault(_lodash);

var _pg = require("pg");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// NOTE: This must be `require` (and not `import`) as it must happen
//       after the `process.env` configuration
process.env.SUPPRESS_NO_CONFIG_WARNING = "y";
let configModule = require("config");

// Declare default configuration
let defaults = {
  // Name for logging
  name: configModule.has("name") ? configModule.get("name") : "Bardo",

  // Logging configuration; the defined level to show
  log: "trace",

  // SQL username [defaults to `process.env.USER`]
  user: "postgres",

  // Password for the SQL username
  password: null,

  // SQL database to use [defaults to `process.env.USER`]
  // name: "bardo",

  // Port to use when connecting to the database server [defaults
  //  to the appropriate value depending on `driver`]
  port: null,

  // Host address of the database server [defaults to `127.0.0.1`]
  host: "192.168.99.100",

  // Automatically commit after each `execute`
  autoCommit: false,

  // Pool configuration
  pool: {
    // Number of unique Client objects to maintain in the pool.
    size: 10,

    // Max milliseconds a client can go unused before it is removed from
    // the pool and destroyed.
    timeout: 30000
  }
};

// Setup default configuration
configModule.util.setModuleDefaults("db", defaults);

// Pull configuration store from "node-config"
let config = _lodash2.default.cloneDeep(configModule.get("db"));

function get(key) {
  let names = key.split(".");
  let result = config;
  for (let name of names) {
    result = result[name];

    // Short-circuit in case of `x.y` where `x` is null
    if (result == null) {
      return result;
    }
  }

  return result;
}

function has(key) {
  return get(key) != null;
}

// Configure merges in new options with the config store
function configure(options) {
  if (options != null) {
    _lodash2.default.merge(config, options);
  }

  // Configure postgres
  _pg.native.defaults.parseInt8 = true;
  _pg.native.defaults.poolSize = get("pool.size");
  _pg.native.defaults.poolIdleTimeout = get("pool.timeout");
}

// Bootstrap
configure();

exports.default = {
  configure: configure,
  get: get,
  has: has
};