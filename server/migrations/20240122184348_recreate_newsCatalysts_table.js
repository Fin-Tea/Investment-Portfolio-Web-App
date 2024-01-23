
exports.up = function(knex) {
    return knex.schema.createTable("newsCatalysts", (t) => {
        t.increments("id").unsigned().primary();
        t.integer("accountId")
          .unsigned()
          .index()
          .references("id")
          .inTable("account");
        t.integer("tradePlanId")
          .unsigned()
          .index()
          .references("id")
          .inTable("tradePlans");
        t.string("label").notNullable();
        t.enum("sentimentType", ["Bullish", "Bearish"]).notNullable();
        t.enum("statusType", ["Expected", "In Play"]).notNullable();
        t.string("url");
        t.string("newsText").notNullable();
        t.dateTime("createdAt").notNullable();
        t.dateTime("updatedAt").notNullable();
        t.dateTime("deletedAt");
      });
};

exports.down = function(knex) {
    return knex.schema.dropTable("newsCatalysts");
};
