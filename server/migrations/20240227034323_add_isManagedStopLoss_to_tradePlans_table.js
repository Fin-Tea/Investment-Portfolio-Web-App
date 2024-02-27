
exports.up = function(knex) {
    return knex.schema.alterTable("tradePlans", (t) => {
        t.boolean("isManagedStopLoss").defaultTo(false);
      });
};

exports.down = function(knex) {
    return knex.schema.alterTable("tradeHistory", (t) => {
        t.dropColumn("isManagedStopLoss");
      });
};
