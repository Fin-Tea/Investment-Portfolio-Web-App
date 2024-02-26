import db from "../db";
import * as csv from "csv-string";
import Bluebird from "bluebird";
import { DateTime } from "luxon";
import { formatDate, formatObjectDates, toCapitalizedCase } from "../utils";
import { HOURS_MARKET_OPEN } from "../constants";

const NUM_BALANCE_DAYS = 30;

export const PLATFORMS = {
  TD_AMERITRADE: 1,
  NINJA_TRADER: 2,
};

const NINJA_TRADER_HEADERS = [
  "symbol",
  "qty",
  "buyPrice",
  "sellPrice",
  "pnl",
  "boughtTimestamp",
  "soldTimestamp",
];

const PNL_REGEX = /[$()]/g;

export async function getTradeHistory(accountId, options = {}) {
  const {
    limit,
    offset,
    tradeId,
    fromDate,
    toDate,
    isProfit,
    isLoss,
    timeRangeType,
    tradeDirectionType,
    securityType,
    securitySymbol,
    securityName,
    isMilestone,
    tradeOpenedAt,
    isPlatformAccounts,
    includeTradePlans,
  } = options;

  let builder = db
    .select(
      "id",
      "tradeOpenedAt",
      "tradeClosedAt",
      "timeRangeType",
      "securityType",
      "tradeDirectionType",
      "quantity",
      "securitySymbol",
      "securityName",
      "openPrice",
      "closePrice",
      "risk",
      "reward",
      "notes",
      "isMilestone",
      "isScaledIn",
      "isScaledOut",
      "catalystId",
      "setupId",
      "openUnderlyingPrice",
      "closeUnderlyingPrice",
      "underlyingSymbol",
      "tradePlanId",
      "platformAccountId",
      "importLogId",
      "pnl"
    )
    .from("tradeHistory")
    .where({ accountId })
    .andWhere({ deletedAt: null });

  if (tradeId) {
    return builder.andWhere({ id: tradeId }).first();
  }
  if (fromDate) {
    builder = builder.andWhere("tradeClosedAt", ">=", formatDate(fromDate));
  }

  if (toDate) {
    builder = builder.andWhere("tradeClosedAt", "<=", formatDate(toDate));
  }

  if (isProfit) {
    builder = builder.andWhere("closePrice", ">=", "openPrice");
  }

  if (isLoss) {
    builder = builder.andWhere("closePrice", "<", "openPrice");
  }

  if (timeRangeType) {
    builder = builder.andWhere({ timeRangeType });
  }

  if (securityType) {
    builder = builder.andWhere({ securityType });
  }

  if (tradeDirectionType) {
    builder = builder.andWhere({ tradeDirectionType });
  }

  if (securitySymbol) {
    builder = builder.andWhere({ securitySymbol });
  }

  if (securityName) {
    builder = builder.andWhere({ securityName });
  }

  if (isMilestone) {
    builder = builder.andWhere({ isMilestone });
  }

  if (isPlatformAccounts) {
    builder = builder.whereNotNull("platformAccountId");
  }

  if (tradeOpenedAt) {
    builder = builder.andWhere(
      "tradeOpenedAt",
      ">=",
      formatDate(tradeOpenedAt)
    );
  }

  builder = builder.orderBy("tradeClosedAt", "desc");

  if (limit) {
    builder = builder.limit(limit);
    if (offset) {
      builder = builder.offset(offset);
    }
  }

  let trades = await builder;

  if (includeTradePlans) {
    console.log("including trade plans");
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

    let tradePlans = await db
      .select(
        "id",
        "hypothesis",
        "invalidationPoint",
        "securitySymbol",
        "tradeDirectionType",
        "setup",
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

    const newsCatalysts = await db
      .select(
        "id",
        "tradePlanId",
        "label",
        "sentimentType",
        "statusType",
        "url",
        "newsText"
      )
      .from("newsCatalysts")
      .whereIn("tradePlanId", tradePlanIds);

    const confirmations = await db
      .select("id", "tradePlanId", "confirmationText")
      .from("confirmations")
      .whereIn("tradePlanId", tradePlanIds);

    const newsCatalystsMap = newsCatalysts.reduce((acc, catalyst) => {
      acc.set(catalyst.tradePlanId, catalyst);
      return acc;
    }, new Map());

    const confirmationsMap = confirmations.reduce((acc, confirmation) => {
      const confirmationsGroup = acc.get(confirmation.tradePlanId) || [];
      confirmationsGroup.push(confirmation);
      acc.set(confirmation.tradePlanId, confirmationsGroup);
      return acc;
    }, new Map());

    tradePlans = tradePlans.map((tradePlan) => {
      const { id } = tradePlan;
      const newsCatalyst = newsCatalystsMap.get(id);
      const confirmations = confirmationsMap.get(id);
      return { ...tradePlan, newsCatalyst, confirmations };
    });

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

export function getOpenTrades(accountId, options = {}) {
  const { limit, offset, tradeOpenedAt } = options;

  let builder = db
    .select(
      "id",
      "tradeOpenedAt",
      "securityType",
      "tradeDirectionType",
      "quantity",
      "securitySymbol",
      "securityName",
      "openPrice",
      "isScaledIn",
      "openUnderlyingPrice",
      "underlyingSymbol"
    )
    .from("openTrades")
    .where({ accountId });

  if (tradeOpenedAt) {
    builder = builder.andWhere(
      "tradeOpenedAt",
      ">=",
      formatDate(tradeOpenedAt)
    );
  }

  builder = builder.orderBy("tradeOpenedAt", "desc");

  if (limit) {
    builder = builder.limit(limit);
    if (offset) {
      builder = builder.offset(offset);
    }
  }

  return builder;
}

export async function revertTradeHistorySync(
  accountId,
  lastTdaSyncedAt,
  prevLastTdaSyncedAt
) {
  if (!(accountId && lastTdaSyncedAt && prevLastTdaSyncedAt)) {
    throw new Error(
      "accountId, lastTdaSyncedAt, & prevLastTdaSyncedAt required"
    );
  }

  const dbDate = formatDate(lastTdaSyncedAt);

  await db("tradeHistory")
    .where({ accountId })
    .andWhere("tradeOpenedAt", ">=", dbDate)
    .del();

  await db("openTrades")
    .where({ accountId })
    .andWhere("tradeOpenedAt", ">=", dbDate)
    .del();

  await db("account")
    .update({
      lastTdaSyncedAt: prevLastTdaSyncedAt,
    })
    .where({ id: accountId });
}

export function getAccountBalanceHistory(accountId, options = {}) {
  const { limit = NUM_BALANCE_DAYS, offset, fromDate, toDate } = options;

  let builder = db
    .select("id", "balanceDate", "balance")
    .from("accountBalance")
    .where({ accountId });

  if (fromDate) {
    builder = builder.andWhere("balanceDate", ">=", formatDate(fromDate));
  }

  if (toDate) {
    builder = builder.andWhere("balanceDate", "<=", formatDate(toDate));
  }

  builder = builder.orderBy("balanceDate", "asc");

  if ((!fromDate && !toDate) || !fromDate || !toDate) {
    builder = builder.limit(limit);

    if (offset) {
      builder = builder.offset(offset);
    }
  }

  return builder;
}

export async function getAllAccountsBalanceHistory(accountIds, options) {
  if (!accountIds.length) {
    return [];
  }

  if (accountIds.length < 2) {
    return getAccountBalanceHistory(accountIds[0], options);
  }

  const balanceHistories = await Bluebird.map(accountIds, (id) =>
    getAccountBalanceHistory(id, options)
  );

  // merge lists two at a time
  const balanceHistory1 = balanceHistories.pop();
  const balanceHistory2 = balanceHistories.pop();

  let mergedBalanceHistory = mergeAccountBalanceHistories(
    balanceHistory1,
    balanceHistory2
  );

  while (balanceHistories.length) {
    const balanceHistory = balanceHistories.pop();
    mergedBalanceHistory = mergeAccountBalanceHistory(
      mergedBalanceHistory,
      balanceHistory
    );
  }

  return mergedBalanceHistory;
}

function getBaseDate(date) {
  if (date) {
    return new Date(
      `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
    );
  }

  return null;
}

// [{"id":13,"balanceDate":"2022-03-13T04:30:11.000Z","balance":8581.42},{"id":14,"balanceDate":"2022-04-02T22:29:28.000Z","balance":6881.47},{"id":16,"balanceDate":"2022-04-10T20:59:55.000Z","balance":6881.48}]

// [{"id":15,"balanceDate":"2022-04-03T18:54:50.000Z","balance":3463.48},{"id":17,"balanceDate":"2022-04-10T20:59:55.000Z","balance":3463.48}]

function mergeAccountBalanceHistories(list1, list2) {
  console.log(typeof list1[0].balanceDate);
  console.log(`list1: ${JSON.stringify(list1)}`);
  console.log(`list2: ${JSON.stringify(list2)}`);

  // merge like linked lists but with reduction
  const mergedBalanceHistory = [];

  let index1 = 0;
  let index2 = 0;

  let d1 = getBaseDate(list1[index1].balanceDate);
  let d2 = getBaseDate(list2[index2].balanceDate);

  while (index1 < list1.length && index2 < list2.length) {
    while (d2 > d1) {
      const balanceHistory1 = list1[index1];
      let balance = balanceHistory1.balance;
      if (index2 > 0 && d1 > getBaseDate(list2[index2 - 1].balanceDate)) {
        console.log("add balances");
        balance += list2[index2 - 1].balance;
      }
      mergedBalanceHistory.push({
        balanceDate: balanceHistory1.balanceDate,
        balance,
      });
      index1++;
      d1 = getBaseDate(list1[index1].balanceDate);
    }
    console.log(JSON.stringify(mergedBalanceHistory));
    const balanceHistory2 = list2[index2];

    if (d2.getTime() === d1.getTime()) {
      // combine
      console.log("combine");
      mergedBalanceHistory.push({
        balanceDate: balanceHistory2.balanceDate,
        balance: balanceHistory2.balance + list1[index1].balance,
      });
      index1++;
    } else {
      // insert
      console.log("insert");
      console.log(`index1: ${index1}`);
      console.log(`index2: ${index2}`);
      console.log(`list1 balance: ${list1[index1 - 1].balance}`);
      mergedBalanceHistory.push({
        balanceDate: balanceHistory2.balanceDate,
        balance: balanceHistory2.balance + list1[index1 - 1].balance,
      });
      console.log(`post insert: ${JSON.stringify(mergedBalanceHistory)}`);
    }

    index2++;

    if (index1 >= list1.length || index2 >= list2.length) {
      break;
    }
    d1 = getBaseDate(list1[index1].balanceDate);
    d2 = getBaseDate(list2[index2].balanceDate);
  }

  // handle any remaining elements
  while (index1 < list1.length) {
    console.log("remaining elements - list1");
    mergedBalanceHistory.push({
      balanceDate: list1[index1].balanceDate,
      balance:
        list1[index1].balance + list2.length
          ? list2[list2.length - 1].balance
          : 0,
    });
    index1++;
  }

  while (index2 < list2.length) {
    console.log("remaining elements - list2");
    mergedBalanceHistory.push({
      balanceDate: list2[index2].balanceDate,
      balance:
        list2[index2].balance + list1.length
          ? list1[list1.length - 1].balance
          : 0,
    });
    index2++;
  }

  return mergedBalanceHistory;
}

export async function updateTradeHistoryBulk(tradeUpdates) {
  const formattedTradeUpdates = formatObjectDates(tradeUpdates);
  const updateInfo = await formattedTradeUpdates.reduce(
    async (acc, tradeUpdate) => {
      try {
        const { id, ...updatedVals } = tradeUpdate;
        await db("tradeHistory").update(updatedVals).where({ id });
        acc.numUpdated++;
      } catch (e) {
        acc.errors.push(e);
      }
      return acc;
    },
    { errors: [], numUpdated: 0 }
  );

  return updateInfo;
}

function readTradePlanTradeResults(accountId, options = {}) {
  const { limit, offset, tradeId, tradePlanId, includeDeleted } = options;

  let builder = db
    .select(
      "accountId",
      "tradePlanId",
      "tradeHistoryId as tradeId",
      "createdAt",
      "updatedAt"
    )
    .from("tradePlanTradeResults")
    .where({ accountId });

  if (tradeId) {
    builder = builder.andWhere({ tradeHistoryId: tradeId });
  }

  if (tradePlanId) {
    builder = builder.andWhere({ tradePlanId });
  }

  if (!includeDeleted) {
    builder = builder.andWhere({ deletedAt: null });
  }

  if (limit) {
    builder = builder.limit(limit);
    if (offset) {
      builder = builder.offset(offset);
    }
  }

  return builder;
}

export async function createTradePlanTradeResultLink(
  accountId,
  tradePlanId,
  tradeId
) {
  const tradePlanTradeResults = await readTradePlanTradeResults(accountId, {
    tradePlanId,
    tradeId,
    includeDeleted: true,
  });

  const now = new Date();

  if (tradePlanTradeResults.length) {
    // update the row, setting deletedAt to null
    await db("tradePlanTradeResults")
      .where({ tradePlanId, tradeHistoryId: tradeId })
      .update({
        deletedAt: null,
        updatedAt: now,
      });
  } else {
    // insert new row
    await db("tradePlanTradeResults").insert([
      {
        accountId,
        tradePlanId,
        tradeHistoryId: tradeId,
        createdAt: now,
        updatedAt: now,
      },
    ]);
  }

  const [tradePlanTradeResult] = await readTradePlanTradeResults(accountId, {
    tradePlanId,
    tradeId,
  });

  return tradePlanTradeResult;
}

export async function deleteTradePlanTradeResultLink(
  accountId,
  tradePlanId,
  tradeId
) {
  const tradePlanTradeResults = await readTradePlanTradeResults(accountId, {
    tradePlanId,
    tradeId,
  });

  if (!tradePlanTradeResults.length) {
    throw new Error(`Trade plan trade result link not found`);
  }

  // update the row, setting deletedAt to current datetime
  await db("tradePlanTradeResults")
    .where({ tradePlanId, tradeHistoryId: tradeId })
    .update({
      deletedAt: new Date(),
    });

  return { tradePlanId, tradeId, delete: true };
}

function getCatalystByDescription(description) {
  const formattedDescription = description.trim().toLowerCase();
  return db("catalyst")
    .select("id", "description")
    .where(db.raw("LOWER(description) = ?", formattedDescription))
    .first();
}

export async function createCatalyst(description) {
  const catalyst = await getCatalystByDescription(description);

  if (!catalyst) {
    const formattedDescription = description.trim();
    await db("catalyst").insert([
      {
        description: formattedDescription,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
    return getCatalystByDescription(description);
  }

  return Promise.resolve(catalyst);
}

export function getCatalysts() {
  return db("catalyst").select("id", "description");
}

function getSetupByDescription(description) {
  const formattedDescription = description.trim().toLowerCase();
  return db("setup")
    .select("id", "description")
    .where(db.raw("LOWER(description) = ?", formattedDescription))
    .first();
}

export async function createSetup(description) {
  const setup = await getSetupByDescription(description);

  if (!setup) {
    const formattedDescription = description.trim();
    await db("setup").insert([
      {
        description: formattedDescription,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
    return getSetupByDescription(description);
  }

  return Promise.resolve(setup);
}

export function getSetups() {
  return db("setup").select("id", "description");
}

export function getTradeDirections() {
  return db("tradeDirection").select("id", "description");
}

export function getTradePlans(accountId, options = {}) {
  const { limit, offset, fromDate, toDate } = options;

  let builder = db
    .select(
      "id",
      "catalystId",
      "validFrom",
      "validUntil",
      "securitySymbol",
      "tradeDirectionType",
      "entry",
      "exit",
      "stopLoss",
      "tradeDescription",
      "isTraded",
      "createdAt"
    )
    .from("tradePlans")
    .where({ accountId });

  if (fromDate) {
    builder = builder.andWhere("createdAt", ">=", formatDate(fromDate));
  }

  if (toDate) {
    builder = builder.andWhere("createdAt", "<=", formatDate(toDate));
  }

  builder = builder.orderBy("createdAt", "desc");

  if (limit) {
    builder = builder.limit(limit);
    if (offset) {
      builder = builder.offset(offset);
    }
  }

  return builder;
}

export function createTradePlansBulk(accountId, tradePlans) {
  const now = new Date();
  let formattedTradePlans = tradePlans.map((tradePlan) => ({
    ...tradePlan,
    accountId,
    createdAt: now,
    updatedAt: now,
  }));
  formattedTradePlans = formatObjectDates(formattedTradePlans);
  return db("tradePlans").insert(formattedTradePlans);
}

export async function updateTradePlansBulk(tradePlanUpdates) {
  const now = new Date();
  let formattedTradePlanUpdates = tradePlanUpdates.map((tradePlanUpdate) => ({
    ...tradePlanUpdate,
    updatedAt: now,
  }));
  formattedTradePlanUpdates = formatObjectDates(formattedTradePlanUpdates);
  const updateInfo = await formattedTradePlanUpdates.reduce(
    async (acc, tradePlanUpdate) => {
      try {
        const { id, ...updatedVals } = tradePlanUpdate;
        await db("tradePlans").update(updatedVals).where({ id });
        acc.numUpdated++;
      } catch (e) {
        acc.errors.push(e);
      }
      return acc;
    },
    { errors: [], numUpdated: 0 }
  );

  return updateInfo;
}

export function parseTDAOrdersFromCSV(file) {
  if (!file) {
    throw new Error("File missing");
  }

  if (!file.name.includes("AccountStatement.csv")) {
    throw new Error(
      "Invalid file. Must be a TD Ameritrade AccounStatement.csv file"
    );
  }

  const data = file.data.toString("utf8");

  if (data.includes("Account Trade History")) {
    const lines = data.split("\n");
    let i = 0;
    const csvParts = [];

    while (lines[i] !== "Account Trade History" && i < lines.length) {
      i++;
    }

    csvParts.push(lines[++i]);

    i++;

    while (lines[i] !== "" && i < lines.length) {
      csvParts.push(lines[i]);
      i++;
    }

    const tradeHistoryCSVString = csvParts.join("\n");

    return csv.parse(tradeHistoryCSVString, { output: "objects" });
  }

  return [];
}

export function parseNinjaTradesFromCSV(file) {
  if (!file) {
    throw new Error("File missing");
  }

  if (!file.name.endsWith(".csv")) {
    throw new Error(
      "Invalid file. Must be a Ninja Trader Performance.csv file"
    );
  }

  const data = file.data.toString("utf8");

  const ninjaCsv = csv.parse(data, { output: "objects" });

  console.log("ninjaCsv", ninjaCsv);

  if (ninjaCsv.length) {
    const keySet = new Set(Object.keys(ninjaCsv[0]));

    NINJA_TRADER_HEADERS.forEach((key) => {
      if (!keySet.has(key)) {
        throw new Error(`Ninja Trader trades CSV missing ${key} header`);
      }
    });
  }

  return ninjaCsv;
}

function groupOrdersBySymbol(uploadedOrders) {
  return uploadedOrders.reduce((acc, order) => {
    const {
      ["Exec Time"]: tradeTime,
      ["Side"]: side,
      ["Qty"]: qty,
      ["Pos Effect"]: positionEffect,
      ["Symbol"]: symbol,
      ["Type"]: type,
      ["Net Price"]: netPrice,
      ["Exp"]: exp,
      ["Strike"]: strike,
    } = order;

    const instruction = `${side} ${positionEffect}`;
    const description = `${symbol} ${exp} ${strike}`;

    const tradeDirectionType =
      instruction === "SELL TO CLOSE" || instruction === "BUY TO OPEN"
        ? "Long"
        : "Short";

    const formattedOrder = {
      tradeTime,
      description,
      instruction,
      netPrice,
      quantity: Math.abs(parseInt(qty)),
      securityType: toCapitalizedCase(type),
      tradeDirectionType,
    };

    let entry = acc.get(symbol);

    if (!entry) {
      entry = {
        symbol,
        description,
        ordersLong: [],
        ordersShort: [],
        tradeDirectionType,
      };
    }

    if (tradeDirectionType === "Long") {
      entry.ordersLong.push(formattedOrder);
    } else {
      entry.ordersShort.push(formattedOrder);
    }

    acc.set(symbol, entry);

    return acc;
  }, new Map());
}

function createTrades(symbol, description, orders, options = {}) {
  const { timezone } = options; // TODO: handle timezone
  const trades = {
    completedTrades: [],
    openTrades: [],
    incompleteClosedTrades: [],
  };
  let i = 0;

  while (i < orders.length) {
    const { tradeTime, instruction, securityType, tradeDirectionType } =
      orders[i];

    const currentTrade = {
      tradeClosedAt: null,
      tradeOpenedAt: null,
      securityType,
      tradeDirectionType,
      closeQty: 0,
      openQty: 0,
      securitySymbol: symbol,
      securityName: description,
      closePrices: [],
      openPrices: [],
    };

    if (instruction.includes("CLOSE")) {
      // it's the end of a trade
      currentTrade.tradeClosedAt = tradeTime; // set the latest close time
      // TODO: handle timezone

      while (i < orders.length && orders[i].instruction.includes("CLOSE")) {
        currentTrade.closeQty += orders[i].quantity;
        currentTrade.closePrices.push(orders[i].netPrice);
        i++;
      }

      while (i < orders.length && orders[i].instruction.includes("OPEN")) {
        currentTrade.openQty += orders[i].quantity;
        currentTrade.openPrices.push(orders[i].netPrice);
        currentTrade.tradeOpenedAt = orders[i].tradeTime; // set the earliest open time
        i++;
      }

      // categorize the trade
      if (currentTrade.openQty === currentTrade.closeQty) {
        trades.completedTrades.push(currentTrade);
      } else if (currentTrade.openQty > currentTrade.closeQty) {
        trades.openTrades.push(currentTrade);
      } else {
        trades.incompleteClosedTrades.push(currentTrade);
      }

      i--;
    } else if (instruction.includes("OPEN")) {
      // it's the beginning of an open trade

      while (i < orders.length && orders[i].instruction.includes("OPEN")) {
        currentTrade.openQty += orders[i].quantity;
        currentTrade.openPrices.push(orders[i].averagePrice);
        currentTrade.tradeOpenedAt = orders[i].tradeTime; // set the earliest open time
        i++;
      }

      trades.openTrades.push(currentTrade);
      i--;
    }
    i++;
  }

  return trades;
}

export function mapUploadedTDAOrdersToTradeInfo(uploadedOrders, options = {}) {
  const { timezone } = options;
  const groupedOrdersMap = groupOrdersBySymbol(uploadedOrders);

  return Array.from(groupedOrdersMap.values()).reduce(
    (acc, groupedOrder) => {
      const { ordersLong, ordersShort, symbol, description } = groupedOrder;

      const tradesLong = createTrades(symbol, description, ordersLong, {
        timezone,
      });
      const tradesShort = createTrades(symbol, description, ordersShort, {
        timezone,
      });

      for (let key in acc) {
        acc[key].push(...tradesLong[key]);
        acc[key].push(...tradesShort[key]);
      }

      return acc;
    },
    { completedTrades: [], openTrades: [], incompleteClosedTrades: [] }
  );
}

export function mapUploadedNinjaTradesToTradeInfo(
  uploadedTrades,
  options = {}
) {
  const { timezone } = options;

  return uploadedTrades.reduce(
    (acc, rawTrade) => {
      const {
        symbol,
        qty,
        buyPrice,
        sellPrice,
        pnl,
        boughtTimestamp,
        soldTimestamp,
      } = rawTrade;

      const buyPriceF = parseFloat(buyPrice);
      const sellPriceF = parseFloat(sellPrice);
      let pnlF = parseFloat(pnl.replace(PNL_REGEX, ""));

      let tradeDirectionType = "Long";
      let tradeOpenedAt = boughtTimestamp;
      let tradeClosedAt = soldTimestamp;
      let openPrice = buyPriceF;
      let closePrice = sellPriceF;

      const isProfit = !pnl.includes("(");

      if (new Date(tradeOpenedAt) > new Date(tradeClosedAt)) {
        tradeOpenedAt = soldTimestamp;
        tradeClosedAt = boughtTimestamp;
      }

      if (isProfit) {
        if (sellPriceF < buyPriceF) {
          tradeDirectionType = "Short";
          openPrice = sellPriceF;
          closePrice = buyPriceF;
        }
      } else {
        if (sellPrice > buyPriceF) {
          tradeDirectionType = "Short";
          openPrice = sellPriceF;
          closePrice = buyPriceF;
        }
        pnlF *= -1;
      }

      tradeOpenedAt = new Date(tradeOpenedAt);
      tradeClosedAt = new Date(tradeClosedAt);

      if (timezone) {
        tradeOpenedAt = DateTime.fromJSDate(tradeOpenedAt)
          .setZone(timezone)
          .toJSDate();
        tradeClosedAt = DateTime.fromJSDate(tradeClosedAt)
          .setZone(timezone)
          .toJSDate();
      }

      const trade = {
        securityType: "Future",
        tradeDirectionType,
        tradeOpenedAt,
        tradeClosedAt,
        openQty: qty,
        closeQty: qty,
        securitySymbol: symbol,
        securityName: symbol.substring(0, symbol.length - 2),
        openPrices: [openPrice],
        closePrices: [closePrice],
        pnl: pnlF,
      };

      acc.completedTrades.push(trade);

      return acc;
    },
    { completedTrades: [], openTrades: [], incompleteClosedTrades: [] }
  );
}

export async function readImportLogs(accountId, options = {}) {
  const { limit, offset, importLogId } = options;

  let builder = db
    .select(
      "id",
      "accountId",
      "platformAccountId",
      "type",
      "jobStatus",
      "message",
      "createdAt",
      "updatedAt"
    )
    .from("importLog")
    .where({ accountId });

  if (importLogId) {
    builder = builder.andWhere({ id: importLogId });
  }

  builder = builder.andWhere({ deletedAt: null });

  if (limit) {
    builder = builder.limit(limit);
    if (offset) {
      builder = builder.offset(offset);
    }
  }

  builder = builder.orderBy("createdAt", "desc");

  return builder;
}

export async function processUploadedTrades(
  accountId,
  platformAccountId,
  importLogType,
  tradeInfo = {}
) {
  const now = new Date();
  const { completedTrades } = tradeInfo;
  const processedTradesInfo = { numTradesSaved: 0, numTradesAlreadyUpdated: 0 };

  console.log("processUploadedTrades");

  let jobStatus = "In Progress";

  if (completedTrades && completedTrades.length) {
    // create a new import log
    const [id] = await db("importLog")
      .insert([
        {
          accountId,
          platformAccountId,
          type: importLogType,
          jobStatus,
          createdAt: now,
          updatedAt: now,
        },
      ])
      .returning("id");

    console.log("processing completed trades");
    const dbTradeInfo = await completedTrades.reduce(
      async (acc, trade) => {
        const newAcc = await acc;
        const {
          tradeOpenedAt: rawTradeOpenedAt,
          tradeClosedAt: rawTradeClosedAt,
          securitySymbol,
          securityName,
          securityType,
          tradeDirectionType,
          openPrices,
          closePrices,
          closeQty,
          pnl,
        } = trade;

        const tradeOpenedAt = new Date(rawTradeOpenedAt);
        const tradeClosedAt = new Date(rawTradeClosedAt);

        const alreadyInsertedTrade = await db
          .select(
            "id",
            "tradeOpenedAt",
            "tradeClosedAt",
            "securityType",
            "tradeDirectionType",
            "quantity",
            "securitySymbol"
          )
          .from("tradeHistory")
          .where({
            accountId,
            tradeOpenedAt,
            tradeClosedAt,
            securitySymbol,
            securityType,
            tradeDirectionType,
          })
          .first();

        if (alreadyInsertedTrade) {
          newAcc.tradesAlreadyInserted.push(alreadyInsertedTrade);
        } else {
          const todayFormatted = new Date();
          const timeRangeType =
            (new Date(tradeClosedAt) - new Date(tradeOpenedAt)) /
              (60 * 60 * 1000) <
            HOURS_MARKET_OPEN
              ? "Day"
              : "Swing";

          const openPrice =
            openPrices.reduce((acc, price) => acc + price, 0) /
            openPrices.length;
          const closePrice =
            closePrices.reduce((acc, price) => acc + price, 0) /
            closePrices.length;

          const isScaledIn = openPrices.length > 1;
          const isScaledOut = closePrices.length > 1;

          const dbTrade = {
            accountId,
            tradeOpenedAt,
            tradeClosedAt,
            timeRangeType,
            securityType,
            tradeDirectionType,
            quantity: closeQty,
            securityName,
            securitySymbol,
            openPrice,
            closePrice,
            isScaledIn,
            isScaledOut,
            createdAt: todayFormatted,
            updatedAt: todayFormatted,
            platformAccountId,
            importLogId: id,
            pnl,
          };

          newAcc.tradesToInsert.push(dbTrade);
        }

        return newAcc;
      },
      {
        tradesToInsert: [],
        tradesAlreadyInserted: [],
      }
    );

    console.log(JSON.stringify(dbTradeInfo));

    try {
      await db("tradeHistory").insert(dbTradeInfo.tradesToInsert);

      // set jobStatus to complete
      jobStatus = "Complete";
    } catch (e) {
      // set jobStatus to error
      jobStatus = "Error";
    }

    await db("importLog").where({ id }).update({ jobStatus, updatedAt: now });

    const [importLog] = await readImportLogs(accountId, { importLogId: id });

    processedTradesInfo.numTradesAlreadyUpdated =
      dbTradeInfo.tradesAlreadyInserted.length;
    processedTradesInfo.numTradesSaved = dbTradeInfo.tradesToInsert.length;
    processedTradesInfo.importLog = importLog;
  }

  // add the importLog to processedTradesInfo

  return processedTradesInfo;
}
