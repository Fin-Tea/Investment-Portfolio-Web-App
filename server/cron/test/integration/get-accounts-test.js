import db from '../../../db';
import { getSyncableAccounts } from '../../../services/account';
import config from '../../../config';

const EMAIL = 'jabari@jabariholloway.com';


function updateTestAccount(lastTdaSyncedAt) {
    return db('account').update({ lastTdaSyncedAt }).where({'email': EMAIL});
}

(async function() {

    // preserve lastTdaSyncedAt date
    const account = await db.select('tdaAccountId', 'lastTdaSyncedAt')
    .from('account')
    .where({'email': EMAIL})
    .first();

    const {lastTdaSyncedAt: originalLastTdaSyncedAt} = account;

    const minInSyncDate = new Date();
    minInSyncDate.setDate(minInSyncDate.getDate() - config.tda.daysUntilNextSync);

    // set account last tda sync date to null
    await updateTestAccount(null);
    
    // expect one account (just print the data for now to move fast. remember, the goal is to 
    // improve as a trader, find consistent profitability, and reach the millionaire level/
    // become an accredited investor. it's not to spend time writing tests

    let accounts = await getSyncableAccounts({minInSyncDate});

    // expect 1 account 
    console.log(accounts.length);
    console.log(JSON.stringify(accounts));


    const inSyncDate = new Date();
    inSyncDate.setDate(inSyncDate.getDate() - config.tda.daysUntilNextSync);
    inSyncDate.setHours(inSyncDate.getHours() + 1);

    await updateTestAccount(inSyncDate);

    accounts = await getSyncableAccounts({minInSyncDate});

    // expect 0 accounts (note: '<' is really '<=' in knex, but this is okay because a 1hr diff works)
    console.log(accounts.length);
    console.log(JSON.stringify(accounts));
    
    const outOfSyncDate = new Date();
    outOfSyncDate.setDate(outOfSyncDate.getDate() - config.tda.daysUntilNextSync - 1);

    await updateTestAccount(outOfSyncDate);

    accounts = await getSyncableAccounts({minInSyncDate});

    // expect 1 account 
    console.log(accounts.length);
    console.log(JSON.stringify(accounts));

    await updateTestAccount(originalLastTdaSyncedAt);

    process.exit(0);
})();