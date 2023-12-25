import util from "util";
import readline from "readline";
import { getSyncableAccount } from "../services/account";
import {
  revertTradeHistorySync,
  getTradeHistory,
  getOpenTrades,
} from "../services/trades";

// jabari@jabariholloway.com

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

    const { id: accountId, lastTdaSyncedAt, prevLastTdaSyncedAt } = account;

    if (lastTdaSyncedAt.getTime() === prevLastTdaSyncedAt.getTime()) {
      console.log("\nTrade history already reverted\n");
      process.exit(0);
    }

    const showDeletableTradeHistory = await question(
      "Show deletable trade history? [y/n] "
    );

    if (
      showDeletableTradeHistory &&
      showDeletableTradeHistory.toLowerCase() === "y"
    ) {
      const tradeHistory = await getTradeHistory(accountId, {
        tradeOpenedAt: prevLastTdaSyncedAt,
      });

      console.log(JSON.stringify(tradeHistory));
    }

    const showDeletableOpenTrades = await question(
      "Show deletable open trades? [y/n] "
    );

    if (
      showDeletableOpenTrades &&
      showDeletableOpenTrades.toLowerCase() === "y"
    ) {
      const openTrades = await getOpenTrades(accountId, {
        tradeOpenedAt: prevLastTdaSyncedAt,
      });
      console.log(JSON.stringify(openTrades));
    }

    const doRevert = await question("Revert trade sync? [y/n] ");

    if (doRevert && doRevert.toLowerCase() === "y") {
      await revertTradeHistorySync(
        accountId,
        lastTdaSyncedAt,
        prevLastTdaSyncedAt
      );
      console.log("\nSync reverted\n");
    } else {
      console.log("\nNo data updated\n");
    }
  } catch (e) {
    console.log(e);
  }

  process.exit(0);
})();
