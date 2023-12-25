
exports.up = function(knex) {
    return knex.schema.alterTable('account', (t) => {
        t.renameColumn('refreshToken', 'tdaRefreshToken');

      }).then(() => {
        return knex.schema.alterTable('account', (t) => {
            t.string('tdaRefreshToken', 2000).alter();
            t.string('tdaAuthToken', 2000).alter();
        })
      });
};

exports.down = function(knex) {
    return knex.schema.alterTable('account', (t) => {
        t.string('tdaAuthToken', 255).alter();
        t.string('tdaRefreshToken', 255).alter();
        t.renameColumn('tdaRefreshToken','refreshToken');
      });
};
