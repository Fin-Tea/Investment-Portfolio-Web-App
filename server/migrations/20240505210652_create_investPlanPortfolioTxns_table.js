
exports.up = function(knex) {
    return knex.schema
    .createTable("investPlanPortfolioTxns", (t) => {
        t.integer("accountId")
        .unsigned()
        .index()
        .references("id")
        .inTable("account");
      t.integer("investPlanId").notNullable(); // TODO: modify this to reference investPlans table after it's created
      t.integer("portfolioTxnId")
      .unsigned()
      .index()
      .references("id")
      .inTable("portfolioTxns").notNullable();
      t.string("decisionNotes", 2500);
      t.string("decisionCategory");
      t.dateTime("createdAt").notNullable();
      t.dateTime("updatedAt").notNullable();
      t.dateTime("deletedAt");
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable("investPlanPortfolioTxns");
};
