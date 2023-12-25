import Bluebird from "bluebird";
import util from "util";
import readline from "readline";
import { getSyncableAccount } from "../services/account";
import { getTradeHistory, updateTradeHistoryBulk } from "../services/trades";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = util.promisify(rl.question).bind(rl);

(async function () {
  try {
    const email = await question("Email: ");

    const account = await getSyncableAccount(email);

    if (!account) {
      console.log("Account not found");
      process.exit(1);
    }

    console.log("\nFetching options trades missing an underlying symbol\n");

    const {
      tdaAccessToken: accessToken,
      tdaRefreshToken: refreshToken,
      tdaRefreshTokenExpiresAt: refreshTokenExpiresAt,
    } = account;

    const tokenInfo = {
      accessToken,
      refreshToken,
      refreshTokenExpiresAt,
    };

    const trades = await getTradeHistory(account.id, {
      securityType: "Option",
    });

    if (!trades.length) {
      console.log("This account has no trades");
      process.exit(0);
    }

    const tradesMissingUnderlyingSymbol = trades.filter(
      ({ underlyingSymbol }) => !underlyingSymbol
    );

    const showTrades = await question("Show trades? [y|n]");

    // TODO: clean up case sensitivity
    if (showTrades === "y" || showTrades === "Y") {
      // log the trades that need updates (can show full json)
      console.log(`\n${JSON.stringify(tradesMissingUnderlyingSymbol)}\n`);
    }

    console.log("\nFinding underlying price updates\n");

    const tradeInfo = await Bluebird.reduce(
      tradesMissingUnderlyingSymbol,
      async (acc, trade) => {
        const { id, tradeOpenedAt, tradeClosedAt, securitySymbol } = trade;

        const error = {
          tradeId: id,
          securitySymbol,
          tradeOpenedAt,
          tradeClosedAt,
          error: "Malformed security symbol",
        };

        const parts = securitySymbol.split("_");

        if (parts.length === 2) {
          const [underlyingSymbol] = parts;
          acc.updates.push({
            id,
            underlyingSymbol,
          });
        } else {
          acc.errors.push(error);
        }

        return acc;
      },
      { updates: [], errors: [] }
    );

    console.log(`\nThere are ${tradeInfo.updates.length} trade updates\n`);

    if (tradeInfo.updates.length) {
      const showTradeUpdates = await question("Show trade updates? [y|n]");

      if (showTradeUpdates === "y" || showTradeUpdates === "Y") {
        console.log(`\n${JSON.stringify(tradeInfo.updates)}\n`);
      }
    }

    console.log(`\nThere are ${tradeInfo.errors.length} trade errors\n`);

    if (tradeInfo.errors.length) {
      const showTradeErrors = await question("Show trade errors? [y|n]");

      if (showTradeErrors === "y" || showTradeErrors === "Y") {
        console.log(`\n${JSON.stringify(tradeInfo.errors)}\n`);
      }
    }

    const doUpdates = await question("Make trade updates? [y|n]");

    if (doUpdates === "y" || doUpdates === "Y") {
      const results = await updateTradeHistoryBulk(tradeInfo.updates);
      console.log("Updates complete");
      console.log(JSON.stringify(results));
    }
  } catch (e) {
    console.log(e);
  }

  process.exit(0);
})();
