function formatDate(date) {
  if (date) {
    const iso = typeof date === "string" ? date : date.toISOString();
    let formattedDate = iso.replace(/[+.]/, " ");
    return formattedDate.split(" ")[0].replace("T", " ");
  }
}

exports.seed = function (knex) {
  // TODO: UPDATE. Running this script now will delete active user accounts
  // Deletes ALL existing entries
  return knex("account")
    .del()
    .then(function () {
      const now = formatDate(new Date());
      // Inserts seed entries
      return knex("account").insert([
        {
          id: 1,
          firstName: "Jabari",
          lastName: "Holloway",
          email: "jabari@jabariholloway.com",
          passwordHash: "test",
          accountName: "Options",
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 2,
          firstName: "Jabari",
          lastName: "Holloway",
          email: "jabarisalih@gmail.com",
          passwordHash: "test",
          accountName: "Futures",
          createdAt: now,
          updatedAt: now,
        },
      ]);
    });
};
