
exports.up = function(knex) {
    return knex.schema.alterTable("tradePlanTradeResults", (t) => {
        t.integer("accountId")
        .unsigned()
        .index()
        .references("id")
        .inTable("account");
      });
};

exports.down = function(knex) {
    return knex.schema.alterTable("tradePlanTradeResults", (t) => {
        t.dropColumn("accountId");
      });
};
