exports.up = function (knex) {
  return knex.schema.alterTable("tradeHistory", (t) => {
    t.string("underlyingSymbol");
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable("tradeHistory", (t) => {
    t.dropColumn("underlyingSymbol");
  });
};
