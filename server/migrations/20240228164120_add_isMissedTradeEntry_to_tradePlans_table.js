
exports.up = function(knex) {
    return knex.schema.alterTable("tradePlans", (t) => {
        t.boolean("isMissedTradeEntry").defaultTo(false);
      });
};

exports.down = function(knex) {
    return knex.schema.alterTable("tradePlans", (t) => {
        t.dropColumn("isMissedTradeEntry");
      });
};
