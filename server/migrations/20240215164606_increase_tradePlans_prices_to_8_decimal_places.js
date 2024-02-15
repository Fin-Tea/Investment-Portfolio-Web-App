
exports.up = function(knex) {
    return knex.schema.alterTable("tradePlans", (t) => {
        t.decimal('entry', 13, 8).alter();
        t.decimal('exit', 13, 8).alter();
        t.decimal('stopLoss', 13, 8).alter();
        t.decimal('priceTarget1', 13, 8).alter();
        t.decimal('priceTarget2', 13, 8).alter();
        t.decimal('priceTarget3', 13, 8).alter();
      });
};

exports.down = function(knex) {
    return knex.schema.alterTable("tradePlans", (t) => {
        t.decimal('entry', 13, 2).alter();
        t.decimal('exit', 13, 2).alter();
        t.decimal('stopLoss', 13, 2).alter();
        t.decimal('priceTarget1', 13, 2).alter();
        t.decimal('priceTarget2', 13, 2).alter();
        t.decimal('priceTarget3', 13, 2).alter();
      });
};
