
exports.up = function(knex) {
    return knex.schema.alterTable("tradeHistory", (t) => {
        t.renameColumn("importId", "importLogId");
      });
};

exports.down = function(knex) {
    return knex.schema.alterTable("tradeHistory", (t) => {
        t.renameColumn("importLogId","importId");
      });
};
