
exports.up = function(knex) {
    return knex.schema
    .createTable("portfolios", (t) => {
      t.increments("id").unsigned().primary();
      t.integer("platformAccountId")
      .unsigned()
      .index()
      .references("id")
      .inTable("platformAccounts").notNullable();
      t.dateTime("createdAt").notNullable();
      t.dateTime("updatedAt").notNullable();
      t.dateTime("deletedAt");
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable("portfolios");
};
