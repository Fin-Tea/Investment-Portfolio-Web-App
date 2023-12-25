exports.up = function (knex) {
  return knex.schema.alterTable("tradeHistory", (t) => {
    t.integer("tradePlanId")
      .unsigned()
      .index()
      .references("id")
      .inTable("tradePlans");
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable("tradeHistory", (t) => {
    t.dropColumn("tradePlanId");
  });
};
