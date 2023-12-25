
exports.up = function(knex) {
    return knex.schema.alterTable('openTrades', (t) => {
        t.boolean('isScaledIn');
      });
};

exports.down = function(knex) {
    return knex.schema.alterTable('openTrades', (t) => {
        t.dropColumn('isScaledIn');
      });
};