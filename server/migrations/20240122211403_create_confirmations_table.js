
exports.up = function(knex) {
    return knex.schema
    .createTable("confirmations", (t) => {
      t.increments("id").unsigned().primary();
      t.integer("accountId")
      .unsigned()
      .index()
      .references("id")
      .inTable("account");
    t.integer("tradePlanId")
      .unsigned()
      .index()
      .references("id")
      .inTable("tradePlans");
      t.string("confirmationText").notNullable();
      t.dateTime("createdAt").notNullable();
      t.dateTime("updatedAt").notNullable();
      t.dateTime("deletedAt");
    });
};

exports.down = function(knex) {
  return knex.schema.dropTable("confirmations");
};
