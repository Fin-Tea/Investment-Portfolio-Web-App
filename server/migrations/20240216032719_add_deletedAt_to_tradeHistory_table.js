
exports.up = function(knex) {
    return knex.schema.alterTable("tradeHistory", (t) => {
        t.dateTime("deletedAt");
      });
};

exports.down = function(knex) {
    return knex.schema.alterTable("tradeHistory", (t) => {
        t.dropColumn("deletedAt");
      });
};
