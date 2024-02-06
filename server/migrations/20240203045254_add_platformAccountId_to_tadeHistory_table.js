
exports.up = function(knex) {
    return knex.schema.alterTable("tradeHistory", (t) => {
        t.integer("platformAccountId")
        .unsigned()
        .index()
        .references("id")
        .inTable("platformAccounts");
      });
};

exports.down = function(knex) {
    return knex.schema.alterTable("tradeHistory", (t) => {
        t.dropColumn("platformAccountId");
      });
};
