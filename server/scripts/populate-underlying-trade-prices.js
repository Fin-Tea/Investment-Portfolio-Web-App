import bluebird from "bluebird";
import util from "util";
import readline from "readline";
import { getSyncableAccount } from "../services/account";
import { getTradeHistory, updateTradeHistoryBulk } from "../services/trades";
import { fetchPriceHistory } from "../integrations/tdameritrade";
import { calcAverageCandlePrice, findNearestCandle } from "../cron/trade-utils";

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

    console.log("\nFetching trades missing underlying entry & exit prices\n");

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

    const tradesMissingUnderlyingPrices = trades.filter(
      ({ openUnderlyingPrice, closeUnderlyingPrice }) =>
        !openUnderlyingPrice && !closeUnderlyingPrice
    );

    const showTrades = await question("Show trades? [y|n]");

    // TODO: clean up case sensitivity
    if (showTrades === "y" || showTrades === "Y") {
      // log the trades that need updates (can show full json)
      console.log(`\n${JSON.stringify(tradesMissingUnderlyingPrices)}\n`);
    }

    console.log("\nFinding underlying price updates\n");

    const tradeInfo = await bluebird.reduce(
      tradesMissingUnderlyingPrices,
      async (acc, trade) => {
        const { id, tradeOpenedAt, tradeClosedAt, underlyingSymbol } = trade;
        //console.log(`acc: ${JSON.stringify(acc)}`);

        const error = {
          tradeId: id,
          underlyingSymbol,
          tradeOpenedAt,
          tradeClosedAt,
          error: "",
        };

        const startDate = new Date(tradeOpenedAt);
        const endDate = new Date(tradeClosedAt);

        startDate.setDate(startDate.getDate() - 1);
        endDate.setDate(endDate.getDate() + 1);

        console.log(underlyingSymbol);

        const priceHistory = await fetchPriceHistory(
          underlyingSymbol,
          {
            startDate,
            endDate,
          },
          tokenInfo
        );

        console.log("waiting 1s...");
        await bluebird.delay(1000);

        // console.log(`priceHistory: ${JSON.stringify(priceHistory)}`);

        if (priceHistory && priceHistory.candles) {
          // console.log(JSON.stringify(priceHistory));
          console.log(`price history length: ${priceHistory.candles.length}`);
          const openCandle = findNearestCandle(
            priceHistory.candles,
            tradeOpenedAt
          );
          const openUnderlyingPrice = calcAverageCandlePrice(openCandle);

          const closeCandle = findNearestCandle(
            priceHistory.candles,
            tradeClosedAt
          );

          const closeUnderlyingPrice = calcAverageCandlePrice(closeCandle);

          if (openUnderlyingPrice && closeUnderlyingPrice) {
            acc.updates.push({
              id,
              openUnderlyingPrice,
              closeUnderlyingPrice,
            });
          } else {
            error.error =
              "Open or close underlying price not found in price history";
            error.openUnderlyingPrice = openUnderlyingPrice;
            error.closeUnderlyingPrice = closeUnderlyingPrice;
            acc.errors.push(error);
          }
        } else {
          error.error = "Price history empty";
          // console.log(`acc: ${JSON.stringify(acc)}`);
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
