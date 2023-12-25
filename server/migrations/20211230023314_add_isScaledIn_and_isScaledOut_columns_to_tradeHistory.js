
exports.up = function(knex) {
    return knex.schema.alterTable('tradeHistory', (t) => {
        t.boolean('isScaledIn');
        t.boolean('isScaledOut');
      });
};

exports.down = function(knex) {
    return knex.schema.alterTable('tradeHistory', (t) => {
        t.dropColumn('isScaledIn');
        t.dropColumn('isScaledOut');
      });
};