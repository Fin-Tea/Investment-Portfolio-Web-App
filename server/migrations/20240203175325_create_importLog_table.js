
exports.up = function(knex) {
    return knex.schema
    .createTable("importLog", (t) => {
      t.increments("id").unsigned().primary();
      t.integer("accountId")
      .unsigned()
      .index()
      .references("id")
      .inTable("account").notNullable();
      t.integer("platformAccountId")
      .unsigned()
      .index()
      .references("id")
      .inTable("platformAccounts").notNullable();
      t.enum("type", ["Sync", "Upload"]).notNullable();
      t.enum("jobStatus", ["Queued", "In Progress", "Complete", "Error", "Deleted", "Reverted"]).notNullable();
      t.string("message");
      t.dateTime("createdAt").notNullable();
      t.dateTime("updatedAt").notNullable();
      t.dateTime("deletedAt");
    }).then(() => {
        return knex.schema.alterTable("tradeHistory", (t) => {
            t.integer("importId")
            .unsigned()
            .index()
            .references("id")
            .inTable("importLog");
          });
      });
};

exports.down = function(knex) {
    return knex.schema.alterTable("tradeHistory", (t) => {
        t.dropColumn("importId");
      }).then(() => {
        return knex.schema.dropTable("importLog");
      });
};
