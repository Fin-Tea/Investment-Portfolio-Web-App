
exports.up = function(knex) {
    return knex.schema.createTable("journalEntries", (t) => {
        t.increments("id").unsigned().primary();
        t.integer("accountId")
          .unsigned()
          .index()
          .references("id")
          .inTable("account");
        t.integer("journalTagId")
          .unsigned()
          .index()
          .references("id")
          .inTable("journalTags");
        t.dateTime("createdAt").notNullable();
        t.dateTime("updatedAt").notNullable();
        t.dateTime("deletedAt");
      });
};

exports.down = function(knex) {
    return knex.schema.dropTable("journalEntries");
};
