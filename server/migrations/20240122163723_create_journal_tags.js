
exports.up = function(knex) {
    const now = new Date();
    return knex.schema
      .createTable("journalTags", (t) => {
        t.increments("id").unsigned().primary();
        t.string("name").notNullable();
        t.dateTime("createdAt").notNullable();
        t.dateTime("updatedAt").notNullable();
      })
      .then(() => {
        return knex("journalTags").insert([
          {
            name: "Trade Plans",
            createdAt: now,
            updatedAt: now
          },
          {
            name: "Milestones",
            createdAt: now,
            updatedAt: now
          },
          {
            name: "Improvement Areas",
            createdAt: now,
            updatedAt: now
          },
          {
            name: "Finstruments",
            createdAt: now,
            updatedAt: now
          },
          {
            name: "Reflections",
            createdAt: now,
            updatedAt: now
          },
        ]);
      });
  
};

exports.down = function(knex) {
    return knex.schema.dropTable("journalTags");
};
