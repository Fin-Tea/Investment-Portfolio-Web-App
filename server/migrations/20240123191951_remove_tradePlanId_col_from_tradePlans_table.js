
exports.up = function(knex) {
    return knex.schema.alterTable("tradePlans", (t) => {
        t.dropColumn("tradePlanId");
      });
};

exports.down = function(knex) {
    return knex.schema.alterTable("tradePlans", (t) => {
        t.integer("tradePlanId");
      });
};
