exports.up = function (knex) {
  return knex.schema.alterTable("account", (t) => {
    t.string("accountName");
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable("account", (t) => {
    t.dropColumn("accountName");
  });
};
