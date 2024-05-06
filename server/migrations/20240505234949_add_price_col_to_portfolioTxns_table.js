
exports.up = function(knex) {
    return knex.schema.alterTable("portfolioTxns", (t) => {
        t.decimal("price", 13,8).notNullable();
      });
};

exports.down = function(knex) {
    return knex.schema.alterTable("portfolioTxns", (t) => {
        t.dropColumn("price");
      });
};
