import util from "util";
import readline from "readline";
import Bluebird from "bluebird";
import { DateTime } from "luxon";
import * as csv from "csv-string";
import { getAccount, readPlatformAccounts } from "../services/account";
import { getTradeHistory, updateTradeHistory } from "../services/trades";
import { readFile } from "fs/promises";

const PNL_REGEX = /[$()]/g;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = util.promisify(rl.question).bind(rl);

(async function () {
  try {
    const email = await question("Type Email: ");

    const account = await getAccount({ email });

    if (!account) {
      throw new Error("Account not found");
    }

    const { id: accountId } = account;

    const platformAccounts = await readPlatformAccounts(accountId);

    console.log("Id | Platform Account name");

    platformAccounts.forEach(({ id, accountName, platform }) => {
      console.log(`${id}, ${platform.name} – ${accountName}`);
    });

    let platformAccountId = await question(
      "Choose Ninja Trader Platform Account Id: "
    );

    platformAccountId = parseInt(platformAccountId.trim());

    const isValidId = platformAccounts.some(
      ({ id }) => id === platformAccountId
    );

    if (!isValidId) {
      console.log("Invalid Platform Account choice");
      process.exit(1);
    }

    const tradeHistory = await getTradeHistory(accountId, {
      platformAccountId,
    });

    console.log("Fetched trades");

    let tradesFilePath = await question(
      "Enter file path to Ninja Trader trades CSV: "
    );

    tradesFilePath = tradesFilePath.trim();

    console.log("Reading file data");

    const fileData = await readFile(tradesFilePath, { encoding: "utf-8" });

    const ninjaCsv = csv.parse(fileData, { output: "objects" });

    console.log("File data read");

    let timezone = await question("(Optional) Enter timezone: ");

    let timezoneOffset = await question("(Optional) Enter timezone offset: ");

    // it's okay to do this inefficiently because the scale is small
    // and the script should only have to be ran once
    const tradesWithWrongTradeDirection = tradeHistory.reduce((acc, trade) => {
      const {
        securitySymbol,
        tradeDirectionType,
        pnl,
        tradeOpenedAt,
        tradeClosedAt,
      } = trade;
      ninjaCsv.forEach((ninjaTrade) => {
        const {
          symbol,
          pnl: rawPnl,
          boughtTimestamp,
          soldTimestamp,
        } = ninjaTrade;

        let pnlF = parseFloat(rawPnl.replace(PNL_REGEX, ""));

        let nTradeDirectionType = "Long";
        const boughtDate = new Date(boughtTimestamp);
        const soldDate = new Date(soldTimestamp);
        let nTradeOpenedAt = boughtDate;
        let nTradeClosedAt = soldDate;

        const isProfit = !rawPnl.includes("(");

        if (nTradeOpenedAt > nTradeClosedAt) {
          nTradeOpenedAt = soldDate;
          nTradeClosedAt = boughtDate;
          nTradeDirectionType = "Short";
        }

        if (!isProfit) {
          pnlF *= -1;
        }

        if (timezone && timezoneOffset) {
          const timezoneOffsetMinutes = parseInt(timezoneOffset);
          nTradeOpenedAt = DateTime.fromJSDate(nTradeOpenedAt)
            .plus({ minutes: timezoneOffsetMinutes })
            .setZone(timezone)
            .toJSDate();
          nTradeClosedAt = DateTime.fromJSDate(nTradeClosedAt)
            .plus({ minutes: timezoneOffsetMinutes })
            .setZone(timezone)
            .toJSDate();
        }

        if (
          symbol === securitySymbol &&
          pnlF === pnl &&
          nTradeDirectionType !== tradeDirectionType
        ) {
          // && nTradeOpenedAt === tradeOpenedAt && nTradeClosedAt === tradeClosedAt
          // if the trades have the same date, month, year minutes, seconds, and the hour is off by at most 1
          let isNeedsFix = false;
          let fixTypes = [];
          if (
            nTradeOpenedAt.getDate() === tradeOpenedAt.getDate() &&
            nTradeOpenedAt.getMonth() === tradeOpenedAt.getMonth() &&
            nTradeOpenedAt.getFullYear() === tradeOpenedAt.getFullYear() &&
            Math.abs(nTradeOpenedAt.getHours() - tradeOpenedAt.getHours()) <=
              1 &&
            nTradeOpenedAt.getMinutes() === tradeOpenedAt.getMinutes() &&
            nTradeOpenedAt.getSeconds() === nTradeOpenedAt.getSeconds()
          ) {
            console.log(symbol);
            console.log(pnlF);
            console.log("nTradeOpenedAt", nTradeOpenedAt);
            console.log("tradeOpenedAt", tradeOpenedAt);
            console.log("nTradeClosedAt", nTradeClosedAt);
            console.log("tradeClosedAt", tradeClosedAt);
            console.log("nTradeDirectionType", nTradeDirectionType);
            console.log("tradeDirectionType", tradeDirectionType);
            isNeedsFix = true;
            fixTypes.push("tradeDirectionType");
          }
          if (
            (trade.tradeDirectionType === "Short" &&
              trade.pnl >= 0 &&
              trade.closePrice > trade.openPrice) ||
            (trade.tradeDirectionType === "Long" &&
              trade.pnl < 0 &&
              trade.openPrice < trade.closePrice)
          ) {
            isNeedsFix = true;
            fixTypes.push("priceSwap");
          }

          if (isNeedsFix) {
            acc.push({ ...trade, fixTypes });
            return;
          }
        }
      });

      return acc;
    }, []);

    console.log("Trades to fix: ");
    console.log(tradesWithWrongTradeDirection.length);
    tradesWithWrongTradeDirection.forEach((trade) => {
      console.log(JSON.stringify(trade));
    });

    let fixTrades = await question("Proceed? [y|n]: ");

    fixTrades = fixTrades.toLowerCase().trim();

    if (fixTrades === "y") {
      console.log("Fixing trades");

      const updatedAt = new Date();

      await Bluebird.map(tradesWithWrongTradeDirection, async (trade) => {
        const { fixTypes } = trade;

        const updatedTradeData = { updatedAt };

        if (fixTypes.includes("tradeDirectionType")) {
          const newTradeDirectionType =
            trade.tradeDirectionType === "Long" ? "Short" : "Long";

          updatedTradeData.tradeDirectionType = newTradeDirectionType;
          if (
            (newTradeDirectionType === "Short" &&
              trade.pnl >= 0 &&
              trade.closePrice > trade.openPrice) ||
            (newTradeDirectionType === "Long" &&
              trade.pnl < 0 &&
              trade.openPrice < trade.closePrice)
          ) {
            updatedTradeData.openPrice = trade.closePrice;
            updatedTradeData.closePrice = trade.openPrice;
          }
        }

        if (fixTypes.includes("priceSwap")) {
          updatedTradeData.openPrice = trade.closePrice;
          updatedTradeData.closePrice = trade.openPrice;
        }

        await updateTradeHistory(accountId, trade.id, updatedTradeData);
      });

      console.log("Trades Fixed!");
      console.log("Exiting");
    }
  } catch (e) {
    console.log(e);
    process.exit(1);
  }

  process.exit(0);
})();
