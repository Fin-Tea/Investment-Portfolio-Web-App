import db from "../db";
import * as csv from "csv-string";
import Bluebird from "bluebird";
import { formatDate, formatObjectDates, toCapitalizedCase } from "../utils";
import { HOURS_MARKET_OPEN } from "../constants";

const NUM_BALANCE_DAYS = 30;

export function getTradeHistory(accountId, options = {}) {
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
      "tradePlanId"
    )
    .from("tradeHistory")
    .where({ accountId });

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

  return builder;
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

function createTrades(symbol, description, orders) {
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

export function mapUploadedTradeHistoryToTradeInfo(uploadedOrders) {
  const groupedOrdersMap = groupOrdersBySymbol(uploadedOrders);

  return Array.from(groupedOrdersMap.values()).reduce(
    (acc, groupedOrder) => {
      const { ordersLong, ordersShort, symbol, description } = groupedOrder;

      const tradesLong = createTrades(symbol, description, ordersLong);
      const tradesShort = createTrades(symbol, description, ordersShort);

      for (let key in acc) {
        acc[key].push(...tradesLong[key]);
        acc[key].push(...tradesShort[key]);
      }

      return acc;
    },
    { completedTrades: [], openTrades: [], incompleteClosedTrades: [] }
  );
}

export async function processUploadedTrades(accountId, tradeInfo = {}) {
  const { completedTrades } = tradeInfo;
  const processedTradesInfo = { numTradesSaved: 0, numTradesAlreadyUpdated: 0 };

  console.log("processUploadedTrades");

  if (completedTrades && completedTrades.length) {
    console.log("processing completed trades");
    const dbTradeInfo = await completedTrades.reduce(
      async (acc, trade) => {
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
        } = trade;

        const tradeOpenedAt = formatDate(new Date(rawTradeOpenedAt));
        const tradeClosedAt = formatDate(new Date(rawTradeClosedAt));

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
          acc.tradesAlreadyInserted.push(alreadyInsertedTrade);
        } else {
          const todayFormatted = formatDate(new Date());
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
          };
          acc.tradesToInsert.push(dbTrade);
        }

        return acc;
      },
      {
        tradesToInsert: [],
        tradesAlreadyInserted: [],
      }
    );

    console.log(JSON.stringify(dbTradeInfo));

    await db("tradeHistory").insert(dbTradeInfo.tradesToInsert);

    processedTradesInfo.numTradesAlreadyUpdated =
      dbTradeInfo.tradesAlreadyInserted.length;
    processedTradesInfo.numTradesSaved = dbTradeInfo.tradesToInsert.length;
  }

  return processedTradesInfo;
}
