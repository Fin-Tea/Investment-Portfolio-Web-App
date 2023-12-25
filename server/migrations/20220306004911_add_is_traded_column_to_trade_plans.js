exports.up = function (knex) {
  return knex.schema.alterTable("tradePlans", (t) => {
    t.boolean("isTraded").defaultTo(false);
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable("tradePlans", (t) => {
    t.dropColumn("isTraded");
  });
};
