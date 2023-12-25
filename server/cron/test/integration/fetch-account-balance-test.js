import db from '../../../db';
import { fetchAccountBalance } from '../../../integrations/tdameritrade';

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

    const currentAccountBalance = await fetchAccountBalance(tdaAccountId, { }, tokenInfo);
    console.log(JSON.stringify(currentAccountBalance));

    process.exit(0);
})();