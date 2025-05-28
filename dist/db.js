"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const config_1 = require("./config");
const pool = new pg_1.Pool({
    connectionString: config_1.db.urldatabase,
    ssl: {
        rejectUnauthorized: false,
    },
});
exports.default = pool;
