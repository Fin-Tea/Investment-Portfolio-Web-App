
exports.up = function(knex) {
    return knex.schema.alterTable('tradeHistory', (t) => {
        t.decimal('risk', 13, 2);
        t.decimal('reward', 13, 2);
      });
};

exports.down = function(knex) {
    return knex.schema.alterTable('tradeHistory', (t) => {
        t.dropColumn('risk');
        t.dropColumn('reward');
      });
};
