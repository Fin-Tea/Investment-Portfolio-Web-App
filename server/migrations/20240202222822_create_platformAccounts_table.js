
exports.up = function(knex) { 
    return knex.schema
    .createTable("platformAccounts", (t) => {
      t.increments("id").unsigned().primary();
      t.integer("accountId")
      .unsigned()
      .index()
      .references("id")
      .inTable("account").notNullable();
      t.integer("platformId")
      .unsigned()
      .index()
      .references("id")
      .inTable("platforms").notNullable();
      t.string("accountName").notNullable();
      t.dateTime("createdAt").notNullable();
      t.dateTime("updatedAt").notNullable();
      t.dateTime("deletedAt");
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable("platformAccounts");
};
