
exports.up = function(knex) {
    return knex.schema.alterTable("tradeHistory", (t) => {
        t.decimal('openPrice', 13, 8).alter();
        t.decimal('closePrice', 13, 8).alter();
        t.decimal('openUnderlyingPrice', 13, 8).alter();
        t.decimal('closeUnderlyingPrice', 13, 8).alter();
      }).then(() => {
        return knex.schema.alterTable("openTrades", (t) => {
            t.decimal('openPrice', 13, 8).alter();
            t.decimal('openUnderlyingPrice', 13, 8).alter();
          });
      })
};

exports.down = function(knex) {
    return knex.schema.alterTable("tradeHistory", (t) => {
        t.decimal('openPrice', 13, 2).alter();
        t.decimal('closePrice', 13, 2).alter();
        t.decimal('openUnderlyingPrice', 13, 2).alter();
        t.decimal('closeUnderlyingPrice', 13, 2).alter();
      }).then(() =>{
        return knex.schema.alterTable("openTrades", (t) => {
            t.decimal('openPrice', 13, 2).alter();
            t.decimal('openUnderlyingPrice', 13, 2).alter();
          });
      })
};
