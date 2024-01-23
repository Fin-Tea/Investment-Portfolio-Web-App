
exports.up = function(knex) {
    const now = new Date();
    return knex.schema
    .createTable("growthTypes", (t) => {
      t.increments("id").unsigned().primary();
      t.string("name").notNullable();
      t.dateTime("createdAt").notNullable();
      t.dateTime("updatedAt").notNullable();
      t.dateTime("deletedAt");
    }).then(() => {
        return knex("growthTypes").insert([
            {
              name: "Earnings",
              createdAt: now,
              updatedAt: now
            },
            {
              name: "Habits",
              createdAt: now,
              updatedAt: now
            },
            {
              name: "Skillz",
              createdAt: now,
              updatedAt: now
            },
            {
              name: "Knowledge",
              createdAt: now,
              updatedAt: now
            },
          ]);

      }).then(() => {
    return knex.schema
    .createTable("milestones", (t) => {
      t.increments("id").unsigned().primary();
      t.integer("journalEntryId")
      .unsigned()
      .index()
      .references("id")
      .inTable("journalEntries");
      t.integer("growthTypeId")
      .unsigned()
      .index()
      .references("id")
      .inTable("growthTypes");
      t.string("milestoneText").notNullable();
      t.dateTime("reachedOn");
    });
 });
};

exports.down = function(knex) {
    return knex.schema.dropTable("growthTypes").then(() => knex.schema.dropTable("milestones"));
};
