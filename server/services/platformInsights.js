import db from "../db";
import { DateTime } from "luxon";
import { formatDate } from "../utils";

const PROFIT = "profit";
const LOSS = "loss";
const NOT_ENOUGH_INFO = "Not enough info";
const NUM_TRADES_DEFAULT = 3;
const QUALITY_TOLERANCE = 0.2;
const REVENGE_TRADE_DURATION_MINUTES = 30;

async function getTradesPnL(platformAccountIds, options = {}) {
  const { fromDate, toDate } = options;

  let builder = db("tradeHistory")
    .select(
      "id",
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

  const trades = await builder;

  // group trades by date (same close date)

  const groupedTrades = trades.reduce((acc, trade) => {
    const {
      tradeClosedAt,
      securityType,
      tradeDirectionType,
      quantity,
      openPrice,
      closePrice,
      pnl,
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
    });

    acc.set(day, trades);

    return acc;
  }, new Map());

  const { dailyPnL, cumulativePnL } = [...groupedTrades.entries()].reduce(
    (acc, [date, trades]) => {
      const totalPnl = trades.reduce((acc2, trade) => {
        const { securityType, quantity, openPrice, closePrice, pnl } = trade;

        if (pnl !== null) {
          console.log("pnl", pnl);
          console.log("pnl type", typeof pnl);
          return acc2 + pnl;
        } else {
          let pnl2 = (closePrice - openPrice) * quantity;

          if (securityType === "Option") {
            pnl2 *= 100;
          }

          return acc2 + pnl2;
        }
      }, 0);

      const cumPnL =
        (acc.cumulativePnL[acc.cumulativePnL.length - 1]
          ? acc.cumulativePnL[acc.cumulativePnL.length - 1].pnl
          : 0) + totalPnl;

      acc.dailyPnL.push({ date, pnl: totalPnl });

      acc.cumulativePnL.push({ date, pnl: cumPnL });

      return acc;
    },
    { dailyPnL: [], cumulativePnL: [] }
  );

  let filteredDailyPnL = dailyPnL;
  let filteredCumulativePnL = cumulativePnL;

  if (fromDate) {
    filteredDailyPnL = filteredDailyPnL.filter(
      (trade) => new Date(trade.date) >= fromDate
    );
    filteredCumulativePnL = filteredCumulativePnL.filter(
      (trade) => new Date(trade.date) >= fromDate
    );
  }

  if (toDate) {
    filteredDailyPnL = filteredDailyPnL.filter(
      (trade) => new Date(trade.date) <= toDate
    );
    filteredCumulativePnL = filteredCumulativePnL.filter(
      (trade) => new Date(trade.date) <= toDate
    );
  }

  return {
    dailyPnL: filteredDailyPnL,
    cumulativePnL: filteredCumulativePnL,
  };
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
    const formattedFromDate = new Date(fromDate);
    builder = builder.andWhere("tradeClosedAt", ">=", formattedFromDate);
  }

  if (toDate) {
    const formattedToDate = new Date(toDate);
    builder = builder.andWhere("tradeClosedAt", "<=", formattedToDate);
  }

  if (orderBy) {
    builder = builder.orderBy(orderBy.col, orderBy.direction);
  }

  let trades = await builder;

  if (includeTradePlans) {
    const tradeHistoryIds = trades.map(({ id }) => id);

    builder = db("tradePlanTradeResults")
      .select("tradePlanId")
      .whereIn("tradeHistoryId", tradeHistoryIds);

    const tradePlanTradeResults = await builder;

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
        "positionSizePercent3"
      )
      .from("tradePlans")
      .whereIn("id", tradePlanIds);

    const tradePlansMap = tradePlans.reduce((acc, tradePlan) => {
      acc.set(tradePlan.id, tradePlan);
      return acc;
    }, new Map());

    trades = trades.map((trade) => {
      const { id } = trade;
      const tradePlanId = tradePlanTradeResultIdsMap.get(id);

      const tradePlan = tradePlansMap.get(tradePlanId);

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

          if (!tradePlan) {
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
            } = tradePlan;

            const isProfit = pnl
              ? pnl >= 0
              : tradeDirectionType === "Long"
              ? closePrice - openPrice >= 0
              : openPrice - closePrice >= 0;

            if (isProfit) {
              const targetPrice = planType === "Simple" ? exit : priceTarget1;
              const profitDelta = Math.abs(targetPrice - entry);
              const profitTolerance = profitDelta * QUALITY_TOLERANCE;
              if (
                Math.abs(closePrice - openPrice) <
                profitDelta - profitTolerance
              ) {
                isHighQuality = false;
              }
            } else {
              const stopLossDelta = Math.abs(entry - stopLoss);
              const stopLossTolerance = stopLossDelta * QUALITY_TOLERANCE;
              if (
                Math.abs(openPrice - closePrice) <
                stopLossDelta + stopLossTolerance
              ) {
                isHighQuality = false;
              }
            }

            if (planType === "Simple") {
              if (Math.abs(exit - entry) / Math.abs(entry - stopLoss) < 2) {
                isHighQuality = false;
              }
              const simpleDelta = Math.abs(closePrice - openPrice);

              if (simpleDelta / Math.abs(entry - stopLoss) < 2) {
                isHighQuality = false;
              }
            } else {
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
    highQualityTrades,
    lowQualityTrades,
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

  return revengeTrades;
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

  return { profitTrades, lossTrades };
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
    const formattedFromDate = new Date(fromDate);
    builder = builder.andWhere("tradeClosedAt", ">=", formattedFromDate);
  }

  if (toDate) {
    const formattedToDate = new Date(toDate);
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
    const formattedFromDate = new Date(fromDate);
    builder = builder.andWhere("tradeClosedAt", ">=", formattedFromDate);
  }

  if (toDate) {
    const formattedToDate = new Date(toDate);
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
    winBuilder = winBuilder.andWhere("tradeClosedAt", ">=", new Date(fromDate));
  }

  if (toDate) {
    winBuilder = winBuilder.andWhere("tradeClosedAt", "<=", new Date(toDate));
  }

  winBuilder = winBuilder.first();

  const { wins } = await winBuilder;
  const { numTrades } = await getNumTrades(platformAccountIds, options);

  return numTrades ? parseFloat((wins / numTrades).toFixed(2)) : 0;
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

  const { profitTrades, lossTrades } = await getPnlTrades(platformAccountIds, options);

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
    lossTrades
  };
}
