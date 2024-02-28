
exports.up = function(knex) {
    return knex.schema.alterTable("reflections", (t) => {
        t.string("thoughts", 2500).notNullable().alter();
      });
};

exports.down = function(knex) {
    return knex.schema.alterTable("reflections", (t) => {
        t.string("thoughts", 1000).notNullable().alter();
    });
};
