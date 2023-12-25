exports.up = async function (knex) {
  await knex("account")
    .update({
      accountName: "Options",
    })
    .where({ email: "jabari@jabariholloway.com" });

  await knex("account")
    .update({
      accountName: "Futures",
    })
    .where({ email: "jabarisalih@gmail.com" });

  return Promise.resolve();
};

exports.down = function (knex) {
  return knex("account").update({ accountName: null });
};
