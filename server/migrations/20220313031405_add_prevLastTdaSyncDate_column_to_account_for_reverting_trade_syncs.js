exports.up = function (knex) {
  return knex.schema.alterTable("account", (t) => {
    t.datetime("prevLastTdaSyncedAt");
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable("account", (t) => {
    t.dropColumn("prevLastTdaSyncedAt");
  });
};
