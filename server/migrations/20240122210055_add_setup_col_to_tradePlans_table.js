
exports.up = function(knex) {
    return knex.schema.alterTable("tradePlans", (t) => {
        t.string("setup");
      });
};

exports.down = function(knex) {
    return knex.schema.alterTable("tradePlans", (t) => {
        t.dropColumn("setup");
      });
};
