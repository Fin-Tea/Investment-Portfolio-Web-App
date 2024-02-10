
exports.up = function(knex) {
    return knex.schema
    .createTable("tradePlanTradeResults", (t) => {
      t.integer("tradePlanId")
      .unsigned()
      .index()
      .references("id")
      .inTable("tradePlans").notNullable();
      t.integer("tradeHistoryId")
      .unsigned()
      .index()
      .references("id")
      .inTable("tradeHistory").notNullable();
      t.dateTime("createdAt").notNullable();
      t.dateTime("updatedAt").notNullable();
      t.dateTime("deletedAt");
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable("tradePlanTradeResults");
};
