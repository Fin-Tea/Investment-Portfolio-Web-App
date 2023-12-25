
exports.up = function(knex) {
    return knex.schema.alterTable('account', (t) => {
        t.renameColumn('lastSyncedAt', 'lastTdaSyncedAt');
      });
};

exports.down = function(knex) {
    return knex.schema.alterTable('account', (t) => {
        t.renameColumn('lastTdaSyncedAt','lastSyncedAt');
      });
};
