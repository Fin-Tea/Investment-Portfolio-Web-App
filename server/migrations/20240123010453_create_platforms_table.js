
exports.up = function(knex) {
    const now = new Date();
    return knex.schema
    .createTable("platforms", (t) => {
      t.increments("id").unsigned().primary();
      t.string("name").notNullable();
      t.string("description");
      t.string("url");
      t.dateTime("createdAt").notNullable();
      t.dateTime("updatedAt").notNullable();
      t.dateTime("deletedAt");
    }).then(() => {
        return knex("platforms").insert([
            {
              name: "TD Ameritrade",
              description: "The best online broker for online stock trading, long-term investing, and retirement planning",
              url: "https://www.tdameritrade.com/",
              createdAt: now,
              updatedAt: now
            },
            {
              name: "Ninja Trader",
              description: "Best Brokerage for Trading Futures. 800,000+ Traders Trust NinjaTrader",
              url: "https://ninjatrader.com/",
              createdAt: now,
              updatedAt: now
            }
          ]);

      });
};

exports.down = function(knex) {
  return knex.schema.dropTable("platform");
};
