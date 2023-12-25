
exports.up = function(knex) {
    return knex.schema.createTable('openTrades',
    (t) => {
        t.increments('id').unsigned().primary();
        t.integer('accountId').unsigned().index().references('id').inTable('account');
        t.dateTime('tradeOpenedAt').notNullable();
        t.enum('securityType', ['Option', 'Stock', 'Future']).notNullable();
        t.enum('tradeDirectionType', ['Long', 'Short']).notNullable();
        t.integer('quantity').notNullable();
        t.string('securitySymbol').notNullable();
        t.string('securityName').notNullable();
        t.decimal('openPrice', 13, 2).notNullable();
        t.dateTime('createdAt').notNullable();
        t.dateTime('updatedAt').notNullable();
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('openTrades');
};
