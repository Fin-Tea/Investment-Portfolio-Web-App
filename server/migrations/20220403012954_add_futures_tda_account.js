exports.up = function (knex) {
  const now = new Date();

  return knex("account").insert([
    {
      firstName: "Jabari",
      lastName: "Holloway",
      email: "jabarisalih@gmail.com",
      passwordHash: "placeholder",
      tdaAccountId: "253775392",
      createdAt: now,
      updatedAt: now,
    },
  ]);
};

exports.down = function (knex) {
  return knex("account").del().where({ email: "jabarisalih@gmail.com" });
};
