
exports.up = function(knex) {
    return knex.schema
    .createTable("portfolioPositions", (t) => {
      t.increments("id").unsigned().primary();
      t.integer("portfolioId")
      .unsigned()
      .index()
      .references("id")
      .inTable("portfolios").notNullable();
      t.string("securitySymbol").notNullable();
      t.boolean("isActive").defaultTo(true);
      t.integer('quantity').notNullable();
      t.dateTime("positionOpenedAt").notNullable();
      t.dateTime("positionClosedAt");
      t.decimal('costBasis', 13, 8).notNullable();
      t.dateTime("createdAt").notNullable();
      t.dateTime("updatedAt").notNullable();
      t.dateTime("deletedAt");
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable("portfolioPositions");
};
