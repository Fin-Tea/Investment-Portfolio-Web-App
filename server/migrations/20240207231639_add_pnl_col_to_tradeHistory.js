
exports.up = function(knex) {
    return knex.schema.alterTable("tradeHistory", (t) => {
        t.decimal('pnl', 13, 2);
      });
};

exports.down = function(knex) {
    return knex.schema.alterTable("tradeHistory", (t) => {
        t.dropColumn("pnl");
      });
};
