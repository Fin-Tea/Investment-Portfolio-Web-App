
exports.up = function(knex) {
    return knex.schema.alterTable('tradeHistory', (t) => {
        t.string('securitySymbol').notNullable();
      });
};

exports.down = function(knex) {
    return knex.schema.alterTable('tradeHistory', (t) => {
        t.dropColumn('securitySymbol');
      });
};
