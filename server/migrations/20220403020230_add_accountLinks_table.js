exports.up = function (knex) {
  const now = new Date();
  return knex.schema
    .createTable("accountLinks", (t) => {
      t.integer("sourceAccountId").unsigned();
      t.integer("linkedAccountId").unsigned();
      t.dateTime("createdAt").notNullable();
    })
    .then(() => {
      return knex("accountLinks").insert([
        {
          sourceAccountId: 1,
          linkedAccountId: 2,
          createdAt: now,
        },
      ]);
    });
};

exports.down = function (knex) {
  return knex.schema.dropTable("accountLinks");
};
