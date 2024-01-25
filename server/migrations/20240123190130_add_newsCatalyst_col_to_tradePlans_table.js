
exports.up = function(knex) {
    return knex.schema.alterTable("tradePlans", (t) => {
        t.integer("newsCatalystId")
        .unsigned()
        .index()
        .references("id")
        .inTable("newsCatalysts");
      });
};

exports.down = function(knex) {
    return knex.schema.alterTable("tradePlans", (t) => {
        t.dropColumn("newsCatalystId"); // TODO: delete catalystId column
      });
};
