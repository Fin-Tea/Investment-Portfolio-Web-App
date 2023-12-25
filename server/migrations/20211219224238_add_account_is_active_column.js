
exports.up = function(knex) {
  return knex.schema.alterTable('account', (t) => {
    t.boolean('isActive').notNullable().defaultTo(true);
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable('account', (t) => {
    t.dropColumn('isActive');
  });
};
