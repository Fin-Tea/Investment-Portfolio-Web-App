
exports.up = function(knex) {
    return knex.schema.alterTable('account', (t) => {
        t.datetime('lastSyncedAt');
      });
};

exports.down = function(knex) {
    return knex.schema.alterTable('account', (t) => {
        t.dropColumn('lastSyncedAt');
      });
};
