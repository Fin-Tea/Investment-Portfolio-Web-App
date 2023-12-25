exports.up = function (knex) {
  return knex.schema.createTable("tradePlans", (t) => {
    t.increments("id").unsigned().primary();
    t.integer("accountId")
      .unsigned()
      .index()
      .references("id")
      .inTable("account");
    t.integer("catalystId")
      .unsigned()
      .index()
      .references("id")
      .inTable("catalyst");
    t.dateTime("validFrom");
    t.dateTime("validUntil");
    t.string("securitySymbol").notNullable();
    t.enum("tradeDirectionType", ["Long", "Short"]).notNullable();
    t.decimal("entry", 13, 2).notNullable();
    t.decimal("exit", 13, 2).notNullable();
    t.decimal("stopLoss", 13, 2).notNullable();
    t.text("tradeDescription");
    t.dateTime("createdAt").notNullable();
    t.dateTime("updatedAt").notNullable();
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("tradePlans");
};
