const knex = require("knex");
const config = require("../config");

const db = knex({
  client: "mysql2",
  connection: {
    ...config.db,
  },
});

module.exports = db;
