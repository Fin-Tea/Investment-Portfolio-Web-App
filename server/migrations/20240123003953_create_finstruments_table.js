
exports.up = function(knex) {
    const now = new Date();
    return knex.schema
    .createTable("securityTypes", (t) => {
      t.increments("id").unsigned().primary();
      t.string("name").notNullable();
      t.dateTime("createdAt").notNullable();
      t.dateTime("updatedAt").notNullable();
      t.dateTime("deletedAt");
    }).then(() => {
        return knex("securityTypes").insert([
            {
              name: "Stock",
              createdAt: now,
              updatedAt: now
            },
            {
              name: "ETF",
              createdAt: now,
              updatedAt: now
            },
            {
              name: "Bond",
              createdAt: now,
              updatedAt: now
            },
            {
              name: "Options",
              createdAt: now,
              updatedAt: now
            },
            {
                name: "Futures",
                createdAt: now,
                updatedAt: now
            },
            {
                name: "Crypto",
                createdAt: now,
                updatedAt: now
            },
            {
                name: "Forex",
                createdAt: now,
                updatedAt: now
            },
          ]);

      }).then(() => {
    return knex.schema
    .createTable("finstruments", (t) => {
      t.increments("id").unsigned().primary();
      t.integer("journalEntryId")
      .unsigned()
      .index()
      .references("id")
      .inTable("journalEntries");
      t.integer("securityTypeId")
      .unsigned()
      .index()
      .references("id")
      .inTable("securityTypes");
      t.string("securitySymbol").notNullable();
      t.string("observations").notNullable();
    });
 });
};

exports.down = function(knex) {
    return knex.schema.dropTable("securityTypes").then(() => knex.schema.dropTable("finstruments"));
};
