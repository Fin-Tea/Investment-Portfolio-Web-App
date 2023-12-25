exports.up = function (knex) {
  return knex.schema.alterTable("tradeHistory", (t) => {
    t.decimal("openUnderlyingPrice", 13, 2);
    t.decimal("closeUnderlyingPrice", 13, 2);
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable("tradeHistory", (t) => {
    t.dropColumn("openUnderlyingPrice");
    t.dropColumn("closeUnderlyingPrice");
  });
};
