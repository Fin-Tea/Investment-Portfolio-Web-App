
exports.up = function(knex) {
    return knex.schema.alterTable('account', (t) => {
        t.datetime('tdaRefreshTokenExpiresAt');
      });
};

exports.down = function(knex) {
    return knex.schema.alterTable('account', (t) => {
        t.dropColumn('tdaRefreshTokenExpiresAt');
      });
};
