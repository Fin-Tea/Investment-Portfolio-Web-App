import db from "../db";
import { DateTime } from "luxon";
import Bluebird from "bluebird";
import { promises as fs } from "fs";
import path from "path";
import { readJournalEntries, JOURNAL_TAGS } from "./journal";
import { formatDate } from "../utils";

const PROFIT = "profit";
const LOSS = "loss";
const NOT_ENOUGH_INFO = "Not enough info";
const NUM_TRADES_DEFAULT = 10;
const QUALITY_TOLERANCE = 0.2;
const REVENGE_TRADE_DURATION_MINUTES = 30;

const PLATFORM_FEES_PATH = path.join(__dirname, "../platform_fees/");

const PLATFORM_NAMES = {
  NINJA_TRADER : "Ninja Trader",
  THINKORSWIM: "thinkorswim",
  SCHWAB: "Charles Schwab"
};

const PLATFORMS_FEES_FILE_NAMES = {
  ["Ninja Trader"] : "ninja-trader.json",
  ["thinkorswim"] : "td-ameritrade.json",
  ["Charles Schwab"]: "schwab.json" 
};

const FUTURES_REGEX = /^\/?[A-Z0-9]+[FGHJKMNQUVXZ]\d+$/;
const OPTIONS_REGEX = /^[A-Z0-9]+\s*\d{6}(P|C)\d+$/;

async function getAccountIds(platformAccountIds) {
  const platformAccounts = await db
    .distinct()
    .select("accountId")
    .from("platformAccounts")
    .whereIn("id", platformAccountIds)
    .andWhere({ deletedAt: null });

  return platformAccounts.map(({ accountId }) => accountId);
}

async function getPlatforms(platformAccountIds) {
  const platformAccounts = await db
    .distinct()
    .select("platformId")
    .from("platformAccounts")
    .whereIn("id", platformAccountIds)
    .andWhere({ deletedAt: null });

  const platformIds = platformAccounts.map(({ platformId }) => platformId);

  return db
  .select("id", "name")
  .from("platforms")
  .whereIn("id", platformIds)
  .andWhere({ deletedAt: null });
}

async function readPlatformFees(platformAccountIds) {

  const platforms = await getPlatforms(platformAccountIds);

  // create fees map (JSON)
  const feesMap = await Bluebird.reduce(platforms, async (acc, platform) => {
      const fileName = PLATFORMS_FEES_FILE_NAMES[platform.name];
      if (fileName) {
        const filePath = `${PLATFORM_FEES_PATH}${fileName}`;

        let data = await fs.readFile(filePath, { encoding: "utf-8" });

        data = JSON.parse(data);

        acc[platform.name] = data;
      }

      return acc;
  }, {});

  return feesMap;

}

function getTradeFees(feesMap, platformName, symbol) {

  if (platformName === PLATFORM_NAMES.NINJA_TRADER) {
    return feesMap[platformName][symbol];
  }

  if (platformName === PLATFORM_NAMES.THINKORSWIM || platformName === PLATFORM_NAMES.SCHWAB) {

    if (FUTURES_REGEX.test(symbol)) {
      return feesMap[platformName]["Futures"];
    }

    if (OPTIONS_REGEX.test(symbol)) {
      return feesMap[platformName]["Options"];
    }

    return feesMap[platformName]["Stocks"];
  }

  return 0;
}

async function getTradesPnL(platformAccountIds, options = {}) {
  const { fromDate, toDate } = options;

  let builder = db("tradeHistory") // join platforms to trades (need to know platform name)
    .select(
      "tradeHistory.id",
      "tradeHistory.tradeClosedAt",
      "tradeHistory.securityType",
      "tradeHistory.tradeDirectionType",
      "tradeHistory.quantity",
      "tradeHistory.securitySymbol",
      "tradeHistory.securityName",
      "tradeHistory.openPrice",
      "tradeHistory.closePrice",
      "tradeHistory.platformAccountId",
      "tradeHistory.pnl",
      "platforms.name as platformName"
    )
    .join("platformAccounts", "platformAccounts.id", "=", "tradeHistory.platformAccountId")
    .join("platforms", "platforms.id", "=", "platformAccounts.platformId")
    .whereIn("platformAccountId", platformAccountIds);

    builder = builder.orderBy("tradeClosedAt", "asc");

  const trades = await builder;

  const platformFeesMap = await readPlatformFees(platformAccountIds);

  // group trades by date (same close date)
  const groupedTrades = trades.reduce((acc, trade) => {
    const {
      securityName,
      tradeClosedAt,
      securityType,
      tradeDirectionType,
      quantity,
      openPrice,
      closePrice,
      pnl,
      platformName
    } = trade;

    const feesBase = getTradeFees(platformFeesMap, platformName, securityName);

    const day = DateTime.fromJSDate(tradeClosedAt).toFormat("yyyy-MM-dd");

    const trades = acc.get(day) || [];

    trades.push({
      date: day,
      tradeClosedAt,
      pnl,
      securityType,
      tradeDirectionType,
      quantity,
      openPrice,
      closePrice,
      fees : quantity * 2 * feesBase
    });

    acc.set(day, trades);

    return acc;
  }, new Map());

  const { dailyPnL, cumulativePnL } = [...groupedTrades.entries()].reduce(
    (acc, [date, trades]) => {
      const {totalPnl, totalFees} = trades.reduce((acc2, trade) => {
        const { securityType, quantity, openPrice, closePrice, pnl, fees } = trade;

        if (pnl !== null) {
           acc2.totalPnl += pnl;
        } else {
          let pnl2 = (closePrice - openPrice) * quantity;

          if (securityType === "Option") {
            pnl2 *= 100;
          }

           acc2.totalPnl += pnl2;
        }

        acc2.totalFees += fees;

        return acc2;
      }, {totalPnl: 0, totalFees: 0});

      // console.log("totalPnl", totalPnl);
      // console.log("totalFees", totalFees);

      // total fees
      const cumPnL =
        (acc.cumulativePnL[acc.cumulativePnL.length - 1]
          ? acc.cumulativePnL[acc.cumulativePnL.length - 1].pnl
          : 0) + totalPnl;

      // cumulative fees
      const cumFees =
      (acc.cumulativePnL[acc.cumulativePnL.length - 1]
        ? acc.cumulativePnL[acc.cumulativePnL.length - 1].fees
        : 0) + totalFees;

      acc.dailyPnL.push({ date, pnl: totalPnl, fees: Math.round(totalFees * 100) / 100 });

      acc.cumulativePnL.push({ date, pnl: cumPnL, fees: Math.round(cumFees * 100) / 100  }); 

      return acc;
    },
    { dailyPnL: [], cumulativePnL: [] }
  );

  let filteredDailyPnL = dailyPnL;
  let filteredCumulativePnL = cumulativePnL;

  console.log("filteredDailyPnL length", filteredDailyPnL.length);
  console.log("filteredCumulativePnL length", filteredCumulativePnL.length);
  console.log("filteredDailyPnL length", JSON.stringify(filteredDailyPnL[0]));

  if (fromDate) {
    const from = new Date(fromDate);
    filteredDailyPnL = filteredDailyPnL.filter((trade) => {
      const tradeDate = new Date(trade.date);
      console.log("Date filter", new Date(trade.date) >= from, tradeDate, from);
      return new Date(trade.date) >= from;
    });
    filteredCumulativePnL = filteredCumulativePnL.filter(
      (trade) => new Date(trade.date) >= from
    );
  }

  console.log("filteredDailyPnL length", filteredDailyPnL.length);
  console.log("filteredCumulativePnL length", filteredCumulativePnL.length);

  if (toDate) {
    const to = new Date(toDate);
    filteredDailyPnL = filteredDailyPnL.filter((trade) => {
      const tradeDate = new Date(trade.date);
      // console.log("Date filter", new Date(trade.date) >= to, tradeDate, to);
      return new Date(trade.date) <= to;
    });
    filteredCumulativePnL = filteredCumulativePnL.filter(
      (trade) => new Date(trade.date) <= to
    );
  }

  console.log("filteredDailyPnL length", filteredDailyPnL.length);
  console.log("filteredCumulativePnL length", filteredCumulativePnL.length);

  return {
    dailyPnL: filteredDailyPnL,
    cumulativePnL: filteredCumulativePnL,
  };
}

function sortTradeInsights(insights) {
  return insights.sort((a,b) => {
    return new Date(a.date) - new Date(b.date);
  });
}

async function getTradeResults(platformAccountIds, options = {}) {
  const { fromDate, toDate, includeTradePlans, orderBy } = options;

  let builder = db("tradeHistory")
    .select(
      "id",
      "tradeOpenedAt",
      "tradeClosedAt",
      "securityType",
      "tradeDirectionType",
      "quantity",
      "securitySymbol",
      "securityName",
      "openPrice",
      "closePrice",
      "platformAccountId",
      "pnl"
    )
    .whereIn("platformAccountId", platformAccountIds);

  if (fromDate) {
    const formattedFromDate = DateTime.fromJSDate(new Date(fromDate))
      .startOf("day")
      .toJSDate();
    builder = builder.andWhere("tradeClosedAt", ">=", formattedFromDate);
  }

  if (toDate) {
    const formattedToDate = DateTime.fromJSDate(new Date(toDate))
      .endOf("day")
      .toJSDate();
    builder = builder.andWhere("tradeClosedAt", "<=", formattedToDate);
  }

  if (orderBy) {
    builder = builder.orderBy(orderBy.col, orderBy.direction);
  }

  let trades = await builder;

  if (includeTradePlans) {
    const tradeHistoryIds = trades.map(({ id }) => id);

    builder = db("tradePlanTradeResults")
      .select("tradePlanId", "tradeHistoryId")
      .whereIn("tradeHistoryId", tradeHistoryIds);

    const tradePlanTradeResults = await builder;

    console.log("tradePlanTradeResults", JSON.stringify(tradePlanTradeResults));

    const tradePlanTradeResultIdsMap = tradePlanTradeResults.reduce(
      (acc, { tradePlanId, tradeHistoryId }) => {
        acc.set(tradeHistoryId, tradePlanId);
        return acc;
      },
      new Map()
    );

    const tradePlanIds = tradePlanTradeResults.map(
      ({ tradePlanId }) => tradePlanId
    );

    const tradePlans = await db
      .select(
        "id",
        "entry",
        "exit",
        "stopLoss",
        "planType",
        "priceTarget1",
        "positionSizePercent1",
        "priceTarget2",
        "positionSizePercent2",
        "priceTarget3",
        "positionSizePercent3",
        "isManagedStopLoss"
      )
      .from("tradePlans")
      .whereIn("id", tradePlanIds);

    // console.log("tradePlans", JSON.stringify(tradePlans));

    const tradePlansMap = tradePlans.reduce((acc, tradePlan) => {
      acc.set(tradePlan.id, tradePlan);
      return acc;
    }, new Map());

    trades = trades.map((trade) => {
      const { id } = trade;
      const tradePlanId = tradePlanTradeResultIdsMap.get(id);

      // console.log("tradePlanId", JSON.stringify(tradePlanId));

      const tradePlan = tradePlansMap.get(tradePlanId);

      // console.log("tradePlan", JSON.stringify(tradePlan));

      return { ...trade, tradePlan };
    });
  }

  return trades;
}

function groupTradesByDay(trades) {
  const groupedTrades = trades.reduce((acc, trade) => {
    const day = DateTime.fromJSDate(trade.tradeClosedAt).toFormat("yyyy-MM-dd");

    const trades = acc.get(day) || [];

    trades.push({
      ...trade,
      date: day,
    });

    acc.set(day, trades);

    return acc;
  }, new Map());

  return groupedTrades;
}

async function getTradesByQuality(platformAccountIds, options = {}) {
  const trades = await getTradeResults(platformAccountIds, {
    ...options,
    includeTradePlans: true,
  });

  console.log("Trade quality trades", JSON.stringify(trades));

  const groupedTrades = trades.reduce((acc, trade) => {
    const {
      tradeClosedAt,
      securityType,
      tradeDirectionType,
      quantity,
      openPrice,
      closePrice,
      pnl,
      tradePlan,
    } = trade;

    const day = DateTime.fromJSDate(tradeClosedAt).toFormat("yyyy-MM-dd");

    const trades = acc.get(day) || [];

    trades.push({
      date: day,
      tradeClosedAt,
      pnl,
      securityType,
      tradeDirectionType,
      quantity,
      openPrice,
      closePrice,
      tradePlan,
    });

    acc.set(day, trades);

    return acc;
  }, new Map());

  const { highQualityTrades, lowQualityTrades } = [
    ...groupedTrades.entries(),
  ].reduce(
    (acc, [date, trades]) => {
      // partition the trades into high & low quality trades
      // and push an obj that is shaped as { date, trades }
      // (keeping the full trades objects for future insights)
      const { high, low } = trades.reduce(
        (acc2, trade) => {
          // check business rules
          let isHighQuality = true;

          const { pnl, tradeDirectionType, openPrice, closePrice, tradePlan } =
            trade;

          console.log("Checking trade quality");

          if (!tradePlan) {
            console.log("No trade plan");
            isHighQuality = false;
          } else {
            const {
              entry,
              exit,
              stopLoss,
              planType,
              priceTarget1, // TODO: Handle quality on multiple price targets (ask Carmine & Dylan about this)
              positionSizePercent1,
              priceTarget2,
              positionSizePercent2,
              priceTarget3,
              positionSizePercent3,
              isManagedStopLoss,
            } = tradePlan;

            const isProfit = pnl
              ? pnl >= 0
              : tradeDirectionType === "Long"
              ? closePrice - openPrice >= 0
              : openPrice - closePrice >= 0;

            if (isProfit && !isManagedStopLoss) {
              const targetPrice = planType === "Simple" ? exit : priceTarget1;
              const profitDelta = Math.abs(targetPrice - entry);
              const profitTolerance = profitDelta * QUALITY_TOLERANCE;
              if (
                Math.abs(closePrice - openPrice) <
                profitDelta - profitTolerance
              ) {
                console.log("Exited early");
                isHighQuality = false;
              }
            } else if (!isProfit) {
              const stopLossDelta = Math.abs(entry - stopLoss);
              const stopLossTolerance = stopLossDelta * QUALITY_TOLERANCE;
              if (
                Math.abs(openPrice - closePrice) <
                stopLossDelta + stopLossTolerance
              ) {
                console.log("Stop lossed too late");
                isHighQuality = false;
              }
            }

            if (planType === "Simple") {
              // Check trade plan Reward Risk
              if (Math.abs(exit - entry) / Math.abs(entry - stopLoss) < 2) {
                console.log("Trade plan RR < 2");
                isHighQuality = false;
              }

              // Check trade Reward Risk, if profitable trade
              if (isProfit && !isManagedStopLoss) {
                const simpleDelta = Math.abs(closePrice - openPrice);

                if (simpleDelta / Math.abs(entry - stopLoss) < 2) {
                  console.log("Trade results RR < 2");
                  isHighQuality = false;
                }
              }
            } else {
              // Check trade plan Reward Risk
              let averageExit =
                (Math.abs(priceTarget1 - entry) * positionSizePercent1) / 100 +
                (Math.abs(priceTarget2 - entry) * positionSizePercent2) / 100;

              if (priceTarget3 && positionSizePercent3) {
                averageExit +=
                  (Math.abs(priceTarget3 - entry) * positionSizePercent3) / 100;
              }

              if (
                Math.abs(averageExit - entry) / Math.abs(entry - stopLoss) <
                2
              ) {
                isHighQuality = false;
              }

              // TODO: Handle quality on multiple price targets (ask Carmine & Dylan about this)
            }
          }

          if (isHighQuality) {
            acc2.high.push(trade);
          } else {
            acc2.low.push(trade);
          }

          return acc2;
        },
        { high: [], low: [] }
      );

      acc.highQualityTrades.push({ date, trades: high });
      acc.lowQualityTrades.push({ date, trades: low });

      return acc;
    },
    { highQualityTrades: [], lowQualityTrades: [] }
  );

  return {
    highQualityTrades: sortTradeInsights(highQualityTrades),
    lowQualityTrades: sortTradeInsights(lowQualityTrades),
  };
}

async function getRevengeTrades(platformAccountIds, options = {}) {
  const trades = await getTradeResults(platformAccountIds, {
    ...options,
    orderBy: { col: "tradeOpenedAt", direction: "asc" },
  });

  const groupedTradesMap = groupTradesByDay(trades);

  const revengeTrades = [...groupedTradesMap.entries()].reduce(
    (acc, [date, trades]) => {
      let lossTradeTime = null;
      let lossSymbol = "";

      const revTrades = [];

      trades.forEach((trade) => {
        const {
          securitySymbol,
          pnl,
          tradeDirectionType,
          openPrice,
          closePrice,
          tradeOpenedAt,
          tradeClosedAt,
          tradePlan,
        } = trade;
        const isLoss = pnl
          ? pnl < 0
          : tradeDirectionType === "Long"
          ? closePrice - openPrice < 0
          : openPrice - closePrice < 0;

        if (isLoss && !lossTradeTime) {
          lossTradeTime = DateTime.fromJSDate(tradeClosedAt);
          lossSymbol = securitySymbol;
        }

        if (lossTradeTime) {
          // check if the trade was opened within the revenge trade duration and has no trade plan
          let timeDiff = DateTime.fromJSDate(tradeOpenedAt).diff(
            lossTradeTime,
            "minutes"
          ).minutes;

          if (
            timeDiff < REVENGE_TRADE_DURATION_MINUTES &&
            !tradePlan &&
            securitySymbol === lossSymbol
          ) {
            revTrades.push(trade);
          } else {
            lossTradeTime = null;
            lossSymbol = "";
          }
        }
      });

      acc.push({ date, trades: revTrades });

      return acc;
    },
    []
  );

  return sortTradeInsights(revengeTrades);
}

async function getPnlTrades(platformAccountIds, options = {}) {
  const trades = await getTradeResults(platformAccountIds, options);

  const groupedTradesMap = groupTradesByDay(trades);

  const { profitTrades, lossTrades } = [...groupedTradesMap.entries()].reduce(
    (acc, [date, trades]) => {
      const { pTrades, lTrades } = trades.reduce(
        (acc2, trade) => {
          const { pnl, tradeDirectionType, openPrice, closePrice } = trade;
          const isProfit = pnl
            ? pnl >= 0
            : tradeDirectionType === "Long"
            ? closePrice - openPrice >= 0
            : openPrice - closePrice >= 0;

          if (isProfit) {
            acc2.pTrades.push(trade);
          } else {
            acc2.lTrades.push(trade);
          }

          return acc2;
        },
        { pTrades: [], lTrades: [] }
      );

      acc.profitTrades.push({ date, trades: pTrades });
      acc.lossTrades.push({ date, trades: lTrades });

      return acc;
    },
    { profitTrades: [], lossTrades: [] }
  );

  return { profitTrades: sortTradeInsights(profitTrades), lossTrades: sortTradeInsights(lossTrades) };
}

async function getNumTrades(platformAccountIds, options = {}) {
  const { fromDate, toDate, profitOrLossType } = options;

  let builder = db("tradeHistory")
    .select(db.raw(`COUNT(id) as numTrades`))
    .whereIn("platformAccountId", platformAccountIds);

  if (profitOrLossType) {
    const greaterThanOrLessThan = profitOrLossType === PROFIT ? ">=" : "<";
    builder = builder.andWhere((bd) => {
      bd.orWhere("pnl", greaterThanOrLessThan, 0).orWhere(
        db.raw(
          "IF(tradeDirectionType = 'Long', closePrice - openPrice, openPrice - closePrice)"
        ),
        greaterThanOrLessThan,
        0
      );
    });
  }

  if (fromDate) {
    const formattedFromDate = DateTime.fromJSDate(new Date(fromDate))
      .startOf("day")
      .toJSDate();
    builder = builder.andWhere("tradeClosedAt", ">=", formattedFromDate);
  }

  if (toDate) {
    const formattedToDate = DateTime.fromJSDate(new Date(toDate))
      .endOf("day")
      .toJSDate();
    builder = builder.andWhere("tradeClosedAt", "<=", formattedToDate);
  }

  return builder.first();
}

async function getTradesValue(platformAccountIds, options = {}) {
  const { fromDate, toDate, profitOrLossType } = options;

  let builder = db("tradeHistory")
    .select(
      db.raw(
        `SUM(IF(pnl is not null, pnl, IF(tradeDirectionType = 'Long', (closePrice - openPrice), (openPrice - closePrice))  * IF(securityType = 'Option', quantity * 100, quantity))) as tradesValue`
      )
    )
    .whereIn("platformAccountId", platformAccountIds);

  if (profitOrLossType) {
    const greaterThanOrLessThan = profitOrLossType === PROFIT ? ">=" : "<";
    builder = builder.andWhere((bd) => {
      bd.orWhere("pnl", greaterThanOrLessThan, 0).orWhere(
        db.raw(
          "IF(tradeDirectionType = 'Long', closePrice - openPrice, openPrice - closePrice)"
        ),
        greaterThanOrLessThan,
        0
      );
    });
  }

  if (fromDate) {
    const formattedFromDate = DateTime.fromJSDate(new Date(fromDate))
      .startOf("day")
      .toJSDate();
    builder = builder.andWhere("tradeClosedAt", ">=", formattedFromDate);
  }

  if (toDate) {
    const formattedToDate = DateTime.fromJSDate(new Date(toDate))
      .endOf("day")
      .toJSDate();
    builder = builder.andWhere("tradeClosedAt", "<=", formattedToDate);
  }

  return builder.first();
}

async function getAverageProfitPerTrade(platformAccountIds, options) {
  const fullOptions = {
    ...options,
    profitOrLossType: PROFIT,
  };
  const { tradesValue } = await getTradesValue(platformAccountIds, fullOptions);
  const { numTrades } = await getNumTrades(platformAccountIds, fullOptions);
  return numTrades ? parseFloat((tradesValue / numTrades).toFixed(2)) : 0;
}

async function getAverageLossPerTrade(platformAccountIds, options) {
  const fullOptions = {
    ...options,
    profitOrLossType: LOSS,
  };

  const { tradesValue } = await getTradesValue(platformAccountIds, fullOptions);
  const { numTrades } = await getNumTrades(platformAccountIds, fullOptions);
  return numTrades ? parseFloat((tradesValue / numTrades).toFixed(2)) : 0;
}

export async function getWinRate(platformAccountIds, options = {}) {
  const { fromDate, toDate } = options;

  let winBuilder = db("tradeHistory")
    .count("id", { as: "wins" })
    .whereIn("platformAccountId", platformAccountIds)
    .andWhere((builder) => {
      builder
        .orWhere("pnl", ">=", 0)
        .orWhere(
          db.raw(
            "IF(tradeDirectionType = 'Long', closePrice - openPrice, openPrice - closePrice) >= 0"
          )
        );
    });

  if (fromDate) {
    const formattedFromDate = DateTime.fromJSDate(new Date(fromDate))
      .startOf("day")
      .toJSDate();
    winBuilder = winBuilder.andWhere("tradeClosedAt", ">=", formattedFromDate);
  }

  if (toDate) {
    const formattedToDate = DateTime.fromJSDate(new Date(toDate))
      .endOf("day")
      .toJSDate();
    winBuilder = winBuilder.andWhere("tradeClosedAt", "<=", formattedToDate);
  }

  winBuilder = winBuilder.first();

  const { wins } = await winBuilder;
  const { numTrades } = await getNumTrades(platformAccountIds, options);

  return numTrades ? parseFloat((wins / numTrades).toFixed(2)) : 0;
}

export async function getPnlBySymbols(platformAccountIds, options = {}) {
  const { fromDate, toDate } = options;

  let builder = db("tradeHistory")
    .select(
      db.raw(
        `securityName, SUM(IF(pnl is not null, pnl, IF(tradeDirectionType = 'Long', (closePrice - openPrice), (openPrice - closePrice))  * IF(securityType = 'Option', quantity * 100, quantity))) as pnl`
      )
    )
    .whereIn("platformAccountId", platformAccountIds);

  if (fromDate) {
    const formattedFromDate = DateTime.fromJSDate(new Date(fromDate))
      .startOf("day")
      .toJSDate();
    builder = builder.andWhere("tradeClosedAt", ">=", formattedFromDate);
  }

  if (toDate) {
    const formattedToDate = DateTime.fromJSDate(new Date(toDate))
      .endOf("day")
      .toJSDate();
    builder = builder.andWhere("tradeClosedAt", "<=", formattedToDate);
  }

  builder = builder.groupBy("securityName");
  builder = builder.orderBy("pnl", "desc");

  return builder;
}

export async function getPnlByTradingSetups(platformAccountIds, options = {}) {
  const { fromDate, toDate } = options;

  let builder = db("tradeHistory")
    .select(
      db.raw(
        `tradePlans.setup as setup, SUM(IF(tradeHistory.pnl is not null, tradeHistory.pnl, IF(tradeHistory.tradeDirectionType = 'Long', (tradeHistory.closePrice - tradeHistory.openPrice), (tradeHistory.openPrice - tradeHistory.closePrice))  * IF(tradeHistory.securityType = 'Option', tradeHistory.quantity * 100, tradeHistory.quantity))) as pnl`
      )
    )
    .innerJoin(
      "tradePlanTradeResults",
      "tradeHistory.id",
      "=",
      "tradePlanTradeResults.tradeHistoryId"
    )
    .innerJoin(
      "tradePlans",
      "tradePlans.id",
      "=",
      "tradePlanTradeResults.tradePlanId"
    )
    .whereIn("tradeHistory.platformAccountId", platformAccountIds);

  if (fromDate) {
    const formattedFromDate = DateTime.fromJSDate(new Date(fromDate))
      .startOf("day")
      .toJSDate();
    builder = builder.andWhere(
      "tradeHistory.tradeClosedAt",
      ">=",
      formattedFromDate
    );
  }

  if (toDate) {
    const formattedToDate = DateTime.fromJSDate(new Date(toDate))
      .endOf("day")
      .toJSDate();
    builder = builder.andWhere(
      "tradeHistory.tradeClosedAt",
      "<=",
      formattedToDate
    );
  }

  builder = builder.groupBy("setup");
  builder = builder.orderBy("pnl", "desc");

  return builder;
}

function getTopTrades(platformAccountIds, options = {}) {
  const {
    fromDate,
    toDate,
    pnlType = PROFIT,
    isSpreadOnly = false,
    numTrades = NUM_TRADES_DEFAULT,
  } = options;

  console.log("getTopTrades fromDate", fromDate);
  console.log("getTopTrades toDate", toDate);

  let builder = db("tradeHistory")
    .select(
      db.raw(`id, IF(tradeDirectionType = 'Long', (closePrice - openPrice), (openPrice - closePrice)) as spread,\ 
        IF(pnl is not null, pnl, IF(tradeDirectionType = 'Long', (closePrice - openPrice), (openPrice - closePrice))  * IF(securityType = 'Option', quantity * 100, quantity)) as pnl,  timeRangeType,\
       securityType, tradeDirectionType, quantity, securitySymbol, securityName, openPrice, closePrice,\
     tradeOpenedAt, tradeClosedAt`)
    )
    .whereIn("platformAccountId", platformAccountIds);

  if (fromDate) {
    const formattedFromDate = DateTime.fromJSDate(new Date(fromDate))
      .startOf("day")
      .toJSDate();
    builder = builder.andWhere("tradeClosedAt", ">=", formattedFromDate);
  }

  if (toDate) {
    const formattedToDate = DateTime.fromJSDate(new Date(toDate))
      .endOf("day")
      .toJSDate();
    builder = builder.andWhere("tradeClosedAt", "<=", formattedToDate);
  }

  let order;

  if (pnlType === PROFIT) {
    order = "desc";
    builder = builder.andWhere("pnl", ">=", 0);
  } else if (pnlType === LOSS) {
    order = "asc";
    builder = builder.andWhere("pnl", "<", 0);
  }

  builder = builder
    .orderBy(isSpreadOnly ? "spread" : "pnl", order)
    .limit(numTrades);

  return builder;
}

async function getAchievedMilestones(platformAccountIds, options = {}) {
  const accountIds = await getAccountIds(platformAccountIds);

  const accountMilestones = await Bluebird.mapSeries(
    accountIds,
    async (accountId) => {
      const journalEntries = await readJournalEntries(accountId, {
        ...options,
        journalTagId: JOURNAL_TAGS.MILESTONES,
      });

      return journalEntries.filter(
        ({ milestone: { reachedOn } }) => !!reachedOn
      );
    }
  );

  return accountMilestones.reduce((acc, milestones) => {
    return acc.concat(milestones);
  }, []);
}

async function getImprovementAreas(platformAccountIds, options = {}) {
  const accountIds = await getAccountIds(platformAccountIds);

  const accountImprovementAreas = await Bluebird.mapSeries(
    accountIds,
    (accountId) => {
      return readJournalEntries(accountId, {
        ...options,
        journalTagId: JOURNAL_TAGS.IMPROVEMENT_AREAS,
      });
    }
  );

  return accountImprovementAreas.reduce((acc, improvementAreas) => {
    return acc.concat(improvementAreas);
  }, []);
}

export async function getInsights(platformAccountIds, options = {}) {
  const { dailyPnL, cumulativePnL } = await getTradesPnL(
    platformAccountIds,
    options
  );
  const winRate = await getWinRate(platformAccountIds, options);
  const { numTrades: totalTrades } = await getNumTrades(
    platformAccountIds,
    options
  );

  const averageProfitAmount = await getAverageProfitPerTrade(
    platformAccountIds,
    options
  );
  const averageLossAmount = await getAverageLossPerTrade(
    platformAccountIds,
    options
  );

  const { highQualityTrades, lowQualityTrades } = await getTradesByQuality(
    platformAccountIds,
    options
  );

  const revengeTrades = await getRevengeTrades(platformAccountIds, options);

  const { profitTrades, lossTrades } = await getPnlTrades(
    platformAccountIds,
    options
  );

  const securitySymbolsPnL = await getPnlBySymbols(platformAccountIds, options);

  const topWinningSecuritySymbols = securitySymbolsPnL.filter(
    ({ pnl }) => pnl >= 0
  );
  const topLosingSecuritySymbols = securitySymbolsPnL.filter(
    ({ pnl }) => pnl < 0
  );
  topLosingSecuritySymbols.sort((a, b) => a.pnl - b.pnl);

  const tradingSetupsPnL = await getPnlByTradingSetups(
    platformAccountIds,
    options
  );

  const topWinningStrategies = tradingSetupsPnL.filter(({ pnl }) => pnl >= 0);
  const topLosingStrategies = tradingSetupsPnL.filter(({ pnl }) => pnl < 0);
  topLosingStrategies.sort((a, b) => a.pnl - b.pnl);

  const topWinningTrades = await getTopTrades(platformAccountIds, {
    ...options,
    pnlType: PROFIT,
  });
  const topLosingTrades = await getTopTrades(platformAccountIds, {
    ...options,
    pnlType: LOSS,
  });

  const milestonesSnapshot = await getAchievedMilestones(
    platformAccountIds,
    options
  );
  const improvementAreasSnapshot = await getImprovementAreas(
    platformAccountIds,
    options
  );

  return {
    dailyPnL,
    cumulativePnL,
    winRate,
    totalTrades,
    averageProfitAmount,
    averageLossAmount,
    highQualityTrades,
    lowQualityTrades,
    revengeTrades,
    profitTrades,
    lossTrades,
    topWinningSecuritySymbols,
    topLosingSecuritySymbols,
    topWinningStrategies,
    topLosingStrategies,
    milestonesSnapshot,
    improvementAreasSnapshot,
    topWinningTrades,
    topLosingTrades,
  };
}
