import db from '../../../db';
import { fetchOrders } from '../../../integrations/tdameritrade';


const EMAIL = 'jabari@jabariholloway.com';

(async function() {
    const account = await db.select('tdaAccountId', 
    'tdaAccessToken', 'tdaRefreshToken', 'tdaRefreshTokenExpiresAt', 'lastTdaSyncedAt')
    .from('account')
    .where({'email': EMAIL})
    .first();

    console.log(`accountId: ${account.tdaAccountId}`);
    const { tdaAccountId, tdaAccessToken: accessToken, 
        tdaRefreshToken: refreshToken, 
        tdaRefreshTokenExpiresAt: refreshTokenExpiresAt } = account;

    const tokenInfo = {
        accessToken,
        refreshToken,
        refreshTokenExpiresAt
    };

    const orders = await fetchOrders(tdaAccountId, { fromEnteredTime: '2021-01-01', toEnteredTime: '2021-12-20' }, tokenInfo );

    console.log(`# of orders: ${orders.length}`);
    console.log(JSON.stringify(orders));

    process.exit(0);
})();