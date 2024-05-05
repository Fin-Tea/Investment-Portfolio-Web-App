
exports.up = function(knex) {
    return knex.schema
    .createTable("portfolioTxns", (t) => {
      t.increments("id").unsigned().primary();
      t.integer("portfolioId")
      .unsigned()
      .index()
      .references("id")
      .inTable("portfolios").notNullable();
      t.string("securitySymbol").notNullable();
      t.enum('tradeDirectionType', ['Long', 'Short']).notNullable();
      t.dateTime("txnDate").notNullable();
      t.enum('action', ['Buy', 'Sell']).notNullable();
      t.integer('quantity').notNullable();
      t.decimal('costBasis', 13, 8).notNullable();
      t.integer("importLogId")
      .unsigned()
      .index()
      .references("id")
      .inTable("importLog");
      t.dateTime("createdAt").notNullable();
      t.dateTime("updatedAt").notNullable();
      t.dateTime("deletedAt");
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable("portfolioTxns");
};
