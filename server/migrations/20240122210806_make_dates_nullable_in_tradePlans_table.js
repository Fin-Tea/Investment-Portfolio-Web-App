
exports.up = function(knex) {
    return knex.schema.alterTable("tradePlans", (t) => {
        t.dateTime("createdAt").nullable().alter();
        t.dateTime("updatedAt").nullable().alter();
      });
};

exports.down = function(knex) {
    return knex.schema.alterTable("tradePlans", (t) => {
        t.dateTime("createdAt").notNullable().alter();
        t.dateTime("updatedAt").notNullable().alter();
      });
};
