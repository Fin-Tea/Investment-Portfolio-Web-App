exports.up = function (knex) {
  return knex.schema.alterTable("openTrades", (t) => {
    t.string("underlyingSymbol");
    t.decimal("openUnderlyingPrice", 13, 2);
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable("openTrades", (t) => {
    t.dropColumn("underlyingSymbol");
    t.dropColumn("openUnderlyingPrice");
  });
};
