exports.up = function(knex) {
    return knex.schema.alterTable("finstruments", (t) => {
        t.string("observations", 2500).notNullable().alter();
      });
};

exports.down = function(knex) {
    return knex.schema.alterTable("finstruments", (t) => {
        t.string("observations", 1000).notNullable().alter();
    });
};