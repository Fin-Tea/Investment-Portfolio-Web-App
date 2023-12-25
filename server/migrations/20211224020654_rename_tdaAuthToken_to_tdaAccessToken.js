
exports.up = function(knex) {
    return knex.schema.alterTable('account', (t) => {
        t.renameColumn('tdaAuthToken', 'tdaAccessToken');
      });
};

exports.down = function(knex) {
    return knex.schema.alterTable('account', (t) => {
        t.renameColumn('tdaAccessToken','tdaAuthToken');
      });  
};
