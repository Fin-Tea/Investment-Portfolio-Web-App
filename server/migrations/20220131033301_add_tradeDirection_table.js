exports.up = function (knex) {
  const now = new Date();
  return knex.schema
    .createTable("tradeDirection", (t) => {
      t.increments("id").unsigned().primary();
      t.text("description").notNullable();
      t.dateTime("createdAt").notNullable();
      t.dateTime("updatedAt").notNullable();
    })
    .then(() => {
      return knex("tradeDirection").insert([
        {
          description: "Long",
          createdAt: now,
          updatedAt: now,
        },
        {
          description: "Short",
          createdAt: now,
          updatedAt: now,
        },
      ]);
    });
};

exports.down = function (knex) {
  return knex.schema.dropTable("tradeDirection");
};
