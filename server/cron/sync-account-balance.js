import bluebird from "bluebird";
import db from "../db";
import { getSyncableAccounts } from "../services/account";
import { fetchAccountBalance } from "../integrations/tdameritrade";
import { formatDate } from "../utils";

/* 
run once a day because tdameritrade doesn't currently provide historical account balance info

Then write the back end (expose the tradeHistory and accountBalance data)
Then write the front end (create the simple, intuitive visuals for the data (good UX))

Then BECOME A CONSISTENTLY PROFITABLE TRADER AND REACH THE MILLIONAIRE INCOME LEVEL
*/

function isAtLeastNextDay(currentDate, futureDate) {
  if (futureDate.getDate() > currentDate.getDate()) {
    return true;
  } else if (futureDate.getMonth() > currentDate.getMonth()) {
    return true;
  } else if (futureDate.getFullYear() > currentDate.getFullYear()) {
    return true;
  }

  return false;
}

export function getMostRecentAccountBalance(accountId) {
  return db
    .select("accountId", "balanceDate", "balance")
    .from("accountBalance")
    .where({ accountId })
    .orderBy("balanceDate", "desc")
    .first();
}

export async function run(overrides) {
  const {
    accountEmails: allowedAccountEmails,
    testMode = false,
    currentDate,
  } = overrides;

  console.log("syncing account balances");

  if (currentDate && !testMode) {
    console.log("currentDate override is only available in testMode. exiting");
    process.exit(1);
  }

  if (testMode) {
    console.log("TEST MODE\n\n(no data will be written to the db)\n\n");
  }

  const syncableAccounts = await getSyncableAccounts({ allowedAccountEmails });

  const today = currentDate || new Date();
  const todayFormatted = formatDate(today);

  const syncResults = await bluebird.mapSeries(
    syncableAccounts,
    async (account) => {
      const {
        id: accountId,
        tdaAccountId,
        tdaAccessToken: accessToken,
        tdaRefreshToken: refreshToken,
        tdaRefreshTokenExpiresAt: refreshTokenExpiresAt,
      } = account;

      const tokenInfo = {
        accessToken,
        refreshToken,
        refreshTokenExpiresAt,
      };

      const result = { accountId };

      // get the most recent account balance
      const mostRecentAccountBalance = await getMostRecentAccountBalance(
        accountId
      );

      let isSyncable = true;

      if (mostRecentAccountBalance) {
        const { balanceDate } = mostRecentAccountBalance;

        const lastSyncDate = new Date(balanceDate);

        if (!isAtLeastNextDay(lastSyncDate, today)) {
          isSyncable = false;
        }
      }

      if (isSyncable) {
        // fetch balance data
        try {
          const balanceInfo = await fetchAccountBalance(
            tdaAccountId,
            {},
            tokenInfo
          );

          if (balanceInfo && balanceInfo.error) {
            throw new Error(balanceInfo.error);
          }

          const balance =
            balanceInfo.securitiesAccount.currentBalances.liquidationValue;

          if (balanceInfo) {
            const accountBalance = {
              accountId,
              balanceDate: todayFormatted,
              balance,
              createdAt: todayFormatted,
            };

            if (!testMode) {
              await db("accountBalance").insert([accountBalance]);
            }
            result.accountBalance = accountBalance;
          }
        } catch (e) {
          result.error = e;
        }
      }

      return result;
    }
  );

  const outputInfo = syncResults.reduce(
    (acc, results) => {
      const { accountId, error } = results;

      if (error) {
        acc.stats.numErrors++;
      } else {
        acc.stats.numAccountsProccessed++;
      }

      acc.resultsByAccount.set(accountId, { ...results });

      return acc;
    },
    {
      stats: {
        numAccountsProccessed: 0,
        numErrors: 0,
      },
      resultsByAccount: new Map(),
    }
  );

  console.log("OUTPUT");
  console.log(JSON.stringify(outputInfo.stats));
  console.log("\n");

  return outputInfo.resultsByAccount;
}
