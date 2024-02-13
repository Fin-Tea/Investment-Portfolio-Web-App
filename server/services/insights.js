import db from "../db";
import { DateTime } from "luxon";
import { formatDate } from "../utils";

const PROFIT = "profit";
const LOSS = "loss";
const NOT_ENOUGH_INFO = "Not enough info";
const NUM_TRADES_DEFAULT = 3;

async function getTotalTradesValue(accountIds, options = {}) {
  const { fromDate, toDate, profitOrLossType } = options;

  let builder = db("tradeHistory")
    .select(
      db.raw(`SUM(IF(tradeDirectionType = 'Long', (closePrice - openPrice), (openPrice - closePrice))  * IF(securityType = 'Option' OR (securityType = 'Future' AND securitySymbol LIKE '/M%'), quantity * 100, quantity)) as totalValue,\ 
    COUNT(id) as totalTrades`)
    )
    .whereIn("accountId", accountIds);

  if (profitOrLossType) {
    const greaterThanOrLessThan = profitOrLossType === PROFIT ? ">=" : "<";
    builder = builder.andWhere(
      db.raw(
        "IF(tradeDirectionType = 'Long', closePrice - openPrice, openPrice - closePrice)"
      ),
      greaterThanOrLessThan,
      0
    );
  }

  if (fromDate) {
    const formattedFromDate = formatDate(fromDate);
    builder = builder.andWhere("tradeClosedAt", ">=", formattedFromDate);
  }

  if (toDate) {
    const formattedToDate = formatDate(toDate);
    builder = builder.andWhere("tradeClosedAt", "<=", formattedToDate);
  }

  return builder.first();
}

export async function getWinRate(accountIds, options = {}) {
  const { fromDate, toDate } = options;

  let winBuilder = db("tradeHistory")
    .count("id", { as: "wins" })
    .whereIn("accountId", accountIds)
    .andWhere(
      db.raw(
        "IF(tradeDirectionType = 'Long', closePrice - openPrice, openPrice - closePrice) >= 0"
      )
    );

  if (fromDate) {
    winBuilder = winBuilder.andWhere(
      "tradeClosedAt",
      ">=",
      formatDate(fromDate)
    );
  }

  if (toDate) {
    winBuilder = winBuilder.andWhere("tradeClosedAt", "<=", formatDate(toDate));
  }

  winBuilder = winBuilder.first();

  const { wins } = await winBuilder;
  const { totalTrades } = await getTotalTradesValue(accountIds, options);

  return (wins / totalTrades).toFixed(2);
}

async function getAverageProfitPerTrade(accountIds, options) {
  const { totalValue, totalTrades } = await getTotalTradesValue(accountIds, {
    ...options,
    profitOrLossType: PROFIT,
  });
  return (totalValue / totalTrades || 0).toFixed(2);
}

async function getAverageLossPerTrade(accountIds, options) {
  const { totalValue, totalTrades } = await getTotalTradesValue(accountIds, {
    ...options,
    profitOrLossType: LOSS,
  });
  console.log(`totalTrades: ${totalTrades}`);
  return (totalValue / totalTrades || 0).toFixed(2);
}

function getBiggestTrades(accountIds, options = {}) {
  const {
    fromDate,
    toDate,
    profitOrLossType = PROFIT,
    isSpreadOnly = false,
    numTrades = NUM_TRADES_DEFAULT,
  } = options;

  let builder = db("tradeHistory")
    .select(
      db.raw(`id, IF(tradeDirectionType = 'Long', (closePrice - openPrice), (openPrice - closePrice)) as spread,\ 
     IF(tradeDirectionType = 'Long', (closePrice - openPrice), (openPrice - closePrice)) * IF(securityType = 'Option' OR (securityType = 'Future' AND securitySymbol LIKE '/M%'), quantity * 100, quantity) as profitOrLoss,  timeRangeType,\
     securityType, tradeDirectionType, quantity, securitySymbol, securityName, openPrice, closePrice,\
     risk, reward, catalystId, setupId, tradeOpenedAt, tradeClosedAt, isScaledIn, isScaledOut`)
    )
    .whereIn("accountId", accountIds);

  if (fromDate) {
    const formattedFromDate = formatDate(fromDate);
    builder = builder.andWhere("tradeClosedAt", ">=", formattedFromDate);
  }

  if (toDate) {
    const formattedToDate = formatDate(toDate);
    builder = builder.andWhere("tradeClosedAt", "<=", formattedToDate);
  }

  let order;

  if (profitOrLossType === PROFIT) {
    order = "desc";
    builder = builder.andWhere(
      db.raw(
        "IF(tradeDirectionType = 'Long', closePrice - openPrice, openPrice - closePrice) >= 0"
      )
    );
  } else {
    order = "asc";
    builder = builder.andWhere(
      db.raw(
        "IF(tradeDirectionType = 'Long', closePrice - openPrice, openPrice - closePrice) < 0"
      )
    );
  }

  builder = builder
    .orderBy(isSpreadOnly ? "spread" : "profitOrLoss", order)
    .limit(numTrades);

  return builder;
}

export function getBiggestWinningTradesByValue(accountIds, options = {}) {
  return getBiggestTrades(accountIds, { ...options, profitOrLossType: PROFIT });
}

export function getBiggestLosingTradesByValue(accountIds, options = {}) {
  return getBiggestTrades(accountIds, { ...options, profitOrLossType: LOSS });
}

export function getBiggestWinningTradesBySpread(accountIds, options = {}) {
  return getBiggestTrades(accountIds, {
    ...options,
    isSpreadOnly: true,
    profitOrLossType: PROFIT,
  });
}

export function getBiggestLosingTradesBySpread(accountIds, options = {}) {
  return getBiggestTrades(accountIds, {
    ...options,
    isSpreadOnly: true,
    profitOrLossType: LOSS,
  });
}

function getBiggestSetup(accountIds, options = {}) {
  const { fromDate, toDate, profitOrLossType = PROFIT } = options;

  const greaterThanOrLessThan = profitOrLossType === PROFIT ? ">=" : "<";

  let builder = db("tradeHistory")
    .select(
      db.raw(
        "tradeHistory.setupId, setup.description as setupDescription, \
     count(tradeHistory.id) as profitOrLossCount"
      )
    )
    .innerJoin("setup", "tradeHistory.setupId", "=", "setup.id")
    .whereIn("tradeHistory.accountId", accountIds)
    .andWhere(
      "tradeHistory.closePrice",
      greaterThanOrLessThan,
      db.ref("tradeHistory.openPrice")
    );

  if (fromDate) {
    const formattedFromDate = formatDate(fromDate);
    builder = builder.andWhere("tradeClosedAt", ">=", formattedFromDate);
  }

  if (toDate) {
    const formattedToDate = formatDate(toDate);
    builder = builder.andWhere("tradeClosedAt", "<=", formattedToDate);
  }

  builder = builder.groupBy("tradeHistory.setupId", "setupDescription");

  const order = profitOrLossType === PROFIT ? "desc" : "asc";

  builder = builder.orderBy("profitOrLossCount", order).limit(1).first();

  return builder;
}

export function getMostProfitableSetup(accountIds, options = {}) {
  return getBiggestSetup(accountIds, { ...options, profitOrLossType: PROFIT });
}

export function getLeastProfitableSetup(accountIds, options = {}) {
  return getBiggestSetup(accountIds, { ...options, profitOrLossType: LOSS });
}

async function getLongestStreak(accountIds, options = {}) {
  const { fromDate, toDate, profitOrLossType = PROFIT } = options;

  let builder = db("tradeHistory")
    .select("id", "tradeClosedAt", "closePrice", "openPrice")
    .whereIn("accountId", accountIds);

  if (fromDate) {
    const formattedFromDate = formatDate(fromDate);
    builder = builder.andWhere("tradeClosedAt", ">=", formattedFromDate);
  }

  if (toDate) {
    const formattedToDate = formatDate(toDate);
    builder = builder.andWhere("tradeClosedAt", "<=", formattedToDate);
  }

  builder = builder.orderBy("tradeClosedAt", "asc");

  const rows = await builder;

  let longestTradeStreak = 0;
  let longestTradeStreakStart = null;
  let longestTradeStreakEnd = null;

  let i = 0;

  while (i < rows.length) {
    const tradeInfo = rows[i];

    let longestStreak = 1;
    let streakStart = tradeInfo.tradeClosedAt;
    let streakEnd = null;

    i++;

    if (profitOrLossType === PROFIT) {
      // find longest win streak
      while (i < rows.length && rows[i].closePrice >= rows[i].openPrice) {
        longestStreak++;
        streakEnd = rows[i].tradeClosedAt;
        i++;
      }

      if (longestStreak > longestTradeStreak) {
        longestTradeStreak = longestStreak;
        longestTradeStreakStart = streakStart;
        longestTradeStreakEnd = streakEnd;
      }

      i--;
    } else {
      // find longest lose streak
      while (i < rows.length && rows[i].closePrice < rows[i].openPrice) {
        longestStreak++;
        streakEnd = rows[i].tradeClosedAt;
        i++;
      }

      if (longestStreak > longestTradeStreak) {
        longestTradeStreak = longestStreak;
        longestTradeStreakStart = streakStart;
        longestTradeStreakEnd = streakEnd;
      }

      i--;
    }
    i++;
  }

  if (!longestTradeStreakEnd && longestTradeStreak === 1) {
    longestTradeStreakEnd = rows[0].tradeClosedAt;
  }

  return {
    longestTradeStreak,
    start: longestTradeStreakStart,
    end: longestTradeStreakEnd,
  };
}

export function getLongestWinningStreak(accountIds, options = {}) {
  return getLongestStreak(accountIds, { ...options, profitOrLossType: PROFIT });
}

export function getLongestLosingStreak(accountIds, options = {}) {
  return getLongestStreak(accountIds, { ...options, profitOrLossType: LOSS });
}

// options: { fromDate, toDate }
export async function getInsights(accountIds, options = {}) {
  const { totalTrades, totalValue: totalProfitLoss } =
    await getTotalTradesValue(accountIds, options);
  const winRate = await getWinRate(accountIds, options);

  const averageWinAmount = await getAverageProfitPerTrade(accountIds, options);
  const averageLossAmount = await getAverageLossPerTrade(accountIds, options);

  const biggestWinningTradesByValue = await getBiggestWinningTradesByValue(
    accountIds,
    options
  );
  const biggestLosingTradesByValue = await getBiggestLosingTradesByValue(
    accountIds,
    options
  );

  const biggestWinningTradesBySpread = await getBiggestWinningTradesBySpread(
    accountIds,
    options
  );
  const biggestLosingTradesBySpread = await getBiggestLosingTradesBySpread(
    accountIds,
    options
  );

  let mostProfitableSetup = await getMostProfitableSetup(accountIds, options);
  let leastProfitableSetup = await getLeastProfitableSetup(accountIds, options);

  if (!mostProfitableSetup) {
    mostProfitableSetup = NOT_ENOUGH_INFO;
  }

  if (!leastProfitableSetup) {
    leastProfitableSetup = NOT_ENOUGH_INFO;
  }

  const longestWinningStreak = await getLongestWinningStreak(
    accountIds,
    options
  );
  const longestLosingStreak = await getLongestLosingStreak(accountIds, options);

  return {
    totalProfitLoss,
    totalTrades,
    winRate,
    averageWinAmount,
    averageLossAmount,
    biggestWinningTradesByValue,
    biggestLosingTradesByValue,
    biggestWinningTradesBySpread,
    biggestLosingTradesBySpread,
    mostProfitableSetup,
    leastProfitableSetup,
    longestWinningStreak,
    longestLosingStreak,
  };
}

