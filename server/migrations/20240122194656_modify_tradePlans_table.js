
exports.up = function(knex) {
    return knex.schema.alterTable("tradePlans", (t) => {
        t.integer("tradePlanId")
          .unsigned()
          .index()
          .references("id")
          .inTable("tradePlans");
        t.integer("journalEntryId")
          .unsigned()
          .index()
          .references("id")
          .inTable("journalEntries");
        t.enum("planType", ["Simple", "Advanced"]).notNullable();
        t.string("hypothesis", 1000).notNullable();
        t.string("invalidationPoint", 1000).notNullable();
        t.decimal("exit", 13, 2).nullable().alter();
        t.decimal("priceTarget1", 13, 2);
        t.decimal("positionSizePercent1", 13, 2);
        t.decimal("priceTarget2", 13, 2);
        t.decimal("positionSizePercent2", 13, 2);
        t.decimal("priceTarget3", 13, 2);
        t.decimal("positionSizePercent3", 13, 2);
        t.string("tradeImgPath", 2000);
      });
};

exports.down = function(knex) {
    return knex.schema.alterTable("tradePlans", (t) => {
        t.dropColumn("tradePlanId");
        t.dropColumn("journalEntryId");
        t.dropColumn("planType");
        t.dropColumn("hypothesis");
        t.dropColumn("invalidationPoint");
        t.dropColumn("exit");
        t.dropColumn("priceTarget1");
        t.dropColumn("positionSizePercent1");
        t.dropColumn("priceTarget2");
        t.dropColumn("positionSizePercent2");
        t.dropColumn("priceTarget3");
        t.dropColumn("positionSizePercent3");
        t.dropColumn("tradeImgPath");
    });
};
