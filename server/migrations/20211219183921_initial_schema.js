
exports.up = function(knex) {

const createAccountTable = () => knex.schema.createTable('account',
(t) => {
    t.increments('id').unsigned().primary();
    t.string('firstName').notNullable();
    t.string('lastName').notNullable();
    t.string('email').notNullable();
    t.string('passwordHash').notNullable();
    t.integer('tdaAccountId');
    t.string('tdaAuthToken');
    t.string('refreshToken');
    t.dateTime('createdAt').notNullable();
    t.dateTime('updatedAt').notNullable();
});

const createAccountBalanceTable = () => knex.schema.createTable('accountBalance',
(t) => {
    t.increments('id').unsigned().primary();
    t.integer('accountId').unsigned().index().references('id').inTable('account');
    t.dateTime('balanceDate').notNullable();
    t.decimal('balance', 13, 2)
    t.dateTime('createdAt').notNullable();
});

const createCatalystTable = () => knex.schema.createTable('catalyst',
(t) => {
    t.increments('id').unsigned().primary();
    t.text('description').notNullable();
    t.dateTime('createdAt').notNullable();
    t.dateTime('updatedAt').notNullable();
});

const createSetupTable = () => knex.schema.createTable('setup',
(t) => {
    t.increments('id').unsigned().primary();
    t.text('description').notNullable();
    t.dateTime('createdAt').notNullable();
    t.dateTime('updatedAt').notNullable();
});

const createTradeHistoryTable = () => knex.schema.createTable('tradeHistory',
(t) => {
    t.increments('id').unsigned().primary();
    t.integer('accountId').unsigned().index().references('id').inTable('account');
    t.dateTime('tradeOpenedAt').notNullable();
    t.dateTime('tradeClosedAt').notNullable();
    t.enum('timeRangeType', ['Day', 'Swing']).notNullable();
    t.enum('securityType', ['Option', 'Stock', 'Future']).notNullable();
    t.enum('tradeDirectionType', ['Long', 'Short']).notNullable();
    t.integer('quantity').notNullable();
    t.string('securityName').notNullable();
    t.decimal('openPrice', 13, 2).notNullable();
    t.decimal('closePrice', 13, 2).notNullable();
    t.integer('catalystId').unsigned().index().references('id').inTable('catalyst');
    t.integer('setupId').unsigned().index().references('id').inTable('setup');
    t.text('notes');
    t.boolean('isMilestone').notNullable().defaultTo(false);
    t.dateTime('createdAt').notNullable();
    t.dateTime('updatedAt').notNullable();
});

const createImprovementActionsTable = () => knex.schema.createTable('improvementActions',
(t) => {
    t.increments('id').unsigned().primary();
    t.integer('accountId').unsigned().index().references('id').inTable('account');
    t.text('action').notNullable();
    t.text('expectedResult').notNullable();
    t.dateTime('startedAt');
    t.dateTime('finishedAt');
    t.text('resultImmediate');
    t.text('result30days');
    t.text('result3Months');
    t.text('result6Months');
    t.text('result1Year');
    t.dateTime('createdAt').notNullable();
    t.dateTime('updatedAt').notNullable();
});


  return createAccountTable()
  .then(createAccountBalanceTable)
  .then(createCatalystTable)
  .then(createSetupTable)
  .then(createTradeHistoryTable)
  .then(createImprovementActionsTable);
};

exports.down = function(knex) {
  
    function dropTable(name) {
        return knex.schema.dropTable(name);
    }

    return dropTable('improvementActions')
    .dropTable('tradeHistory')
    .dropTable('setup')
    .dropTable('catalyst')
    .dropTable('accountBalance')
    .dropTable('account');

};
