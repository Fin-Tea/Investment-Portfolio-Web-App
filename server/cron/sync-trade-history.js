import bluebird from "bluebird";
import db from "../db";
import { formatDate, restoreDate, toCapitalizedCase } from "../utils";
import { getSyncableAccounts } from "../services/account";
import tdaApi, { fetchPriceHistory } from "../integrations/tdameritrade";
import config from "../config";
import { calcAverageCandlePrice, findNearestCandle } from "./trade-utils";
import { HOURS_MARKET_OPEN } from "../constants";

const FRIDAY = 5;
const MIN_DATA_MONTHS = 6;

const ORDER_STRATEGY_TYPES = ["SINGLE", "TRIGGER"];

const createOrderGrouping = ({ symbol, description, tradeDirection }) => ({
  symbol,
  description,
  ordersLong: [],
  ordersShort: [],
  tradeDirection,
});

function createTrades(symbol, description, orders) {
  const trades = {
    completedTrades: [],
    openTrades: [],
    incompleteClosedTrades: [],
  };
  let i = 0;

  while (i < orders.length) {
    const {
      instruction,
      tradeTime,
      securityType,
      tradeDirectionType,
      underlyingSymbol,
    } = orders[i];

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
      underlyingSymbol,
    };

    // need to process long and short orders
    if (instruction.includes("CLOSE")) {
      // it's the end of a trade
      currentTrade.tradeClosedAt = tradeTime; // set the latest close time

      while (i < orders.length && orders[i].instruction.includes("CLOSE")) {
        currentTrade.closeQty += orders[i].quantity;
        currentTrade.closePrices.push(orders[i].averagePrice);
        i++;
      }

      while (i < orders.length && orders[i].instruction.includes("OPEN")) {
        currentTrade.openQty += orders[i].quantity;
        currentTrade.openPrices.push(orders[i].averagePrice);
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

export function mapOrdersToTrades(orders) {
  // only process single orders for now (no bull call spreads, no butterflies, no straddles, no condors)
  const groupedOrdersMap = orders.reduce((acc, order) => {
    const {
      status,
      orderStrategyType,
      quantity,
      filledQuantity,
      closeTime: tradeTime,
      orderActivityCollection,
      orderLegCollection,
    } = order;

    if (
      status === "FILLED" &&
      ORDER_STRATEGY_TYPES.includes(orderStrategyType) &&
      quantity === filledQuantity
    ) {
      // single orders means there's only 1 leg
      const {
        orderLegType,
        instrument: { symbol, description, underlyingSymbol },
        instruction,
      } = orderLegCollection[0];

      // need average order price
      const weightedPriceSum = orderActivityCollection.reduce(
        (acc, activity) => {
          const { executionLegs } = activity;
          const { quantity, price } = executionLegs[0];
          return acc + quantity * price;
        },
        0
      );

      let averagePrice = weightedPriceSum / quantity;

      const tradeDirectionType =
        instruction === "SELL_TO_CLOSE" || instruction === "BUY_TO_OPEN"
          ? "Long"
          : "Short";

      const order = {
        tradeTime,
        description,
        instruction,
        averagePrice,
        quantity,
        securityType: toCapitalizedCase(orderLegType),
        tradeDirectionType,
        underlyingSymbol,
      };

      let entry = acc.get(symbol);

      if (!entry) {
        entry = createOrderGrouping({ symbol, description });
      }

      if (tradeDirectionType === "Long") {
        entry.ordersLong.push(order);
      } else {
        entry.ordersShort.push(order);
      }

      acc.set(symbol, entry);
    }
    return acc;
  }, new Map());

  const trades = Array.from(groupedOrdersMap.values()).reduce(
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

  return trades;
}

async function augmentTradesWithUnderlyingPrices(trades, tokenInfo) {
  return bluebird.mapSeries(trades, async (trade) => {
    const augmentedTrade = { ...trade };

    if (augmentedTrade.securityType === "Option") {
      const tradeOpenedAt = restoreDate(augmentedTrade.tradeOpenedAt);
      const tradeClosedAt = restoreDate(augmentedTrade.tradeClosedAt);

      let startDate = new Date(tradeOpenedAt);

      let endDate = new Date(startDate);

      if (tradeClosedAt) {
        endDate = new Date(tradeClosedAt);
      }

      if (augmentedTrade.openUnderlyingPrice) {
        startDate = new Date(endDate);
      }

      startDate.setDate(startDate.getDate() - 1);
      endDate.setDate(endDate.getDate() + 1);

      const priceHistory = await fetchPriceHistory(
        augmentedTrade.underlyingSymbol,
        { startDate, endDate },
        tokenInfo
      );

      await bluebird.delay(1000);

      if (priceHistory && priceHistory.candles) {
        let openUnderlyingPrice = null;

        if (!augmentedTrade.openUnderlyingPrice) {
          const openCandle = findNearestCandle(
            priceHistory.candles,
            tradeOpenedAt
          );
          openUnderlyingPrice = calcAverageCandlePrice(openCandle);
        }

        let closeUnderlyingPrice = null;

        if (tradeClosedAt) {
          const closeCandle = findNearestCandle(
            priceHistory.candles,
            tradeClosedAt
          );

          closeUnderlyingPrice = calcAverageCandlePrice(closeCandle);
        }

        // assume security prices will never be 0 and cause a falsey bug
        if (!augmentedTrade.openUnderlyingPrice) {
          augmentedTrade.openUnderlyingPrice = openUnderlyingPrice;
        }

        if (!augmentedTrade.closeUnderlyingPrice) {
          augmentedTrade.closeUnderlyingPrice = closeUnderlyingPrice;
        }
      }
    }

    return augmentedTrade;
  });
}

export async function run(overrides = {}) {
  // include overrides to test/debug the script
  const {
    accountEmails: allowedAccountEmails,
    initialSync = false, // testMode only
    testMode = false,
    currentDate, // testMode only
    lastSyncedAt, // testMode only
  } = overrides;

  console.log("syncing trade history");

  if ((initialSync || currentDate || lastSyncedAt) && !testMode) {
    console.log(
      "initialSync and currentDate overrides only available in testMode. exiting"
    );
    process.exit(1);
  }

  if (initialSync && lastSyncedAt) {
    console.log("must set initialSync or lastSyncedAt, not both. exiting");
  }

  if (testMode) {
    console.log("TEST MODE\n\n(no data will be written to the db)\n\n");
  }

  // get syncable accounts
  const minInSyncDate = currentDate ? new Date(currentDate) : new Date();
  minInSyncDate.setDate(minInSyncDate.getDate() - config.tda.daysUntilNextSync);

  const today = currentDate ? new Date(currentDate) : new Date();
  const todayFormatted = formatDate(today);
  const yearStart = currentDate ? new Date(currentDate) : new Date();

  yearStart.setMonth(0);
  yearStart.setDate(1);

  const currentDay = today.getDay();
  let daysFromMostRecentFriday = currentDay - FRIDAY;

  if (daysFromMostRecentFriday < 0) {
    daysFromMostRecentFriday += 7;
  }

  // note: this could be off by a day if it's not actually today in the server's timezone (utc challenge)
  const mostRecentFriday = new Date(
    today.setDate(today.getDate() - daysFromMostRecentFriday)
  );

  const mrfYear = mostRecentFriday.getFullYear();
  const mrfMonth = mostRecentFriday.getMonth() + 1;
  const mrfDate = mostRecentFriday.getDate();
  const toEnteredTime = `${mrfYear}-${mrfMonth < 10 ? "0" : ""}${mrfMonth}-${
    mrfDate < 10 ? "0" : ""
  }${mrfDate}`;

  const syncableAccounts = await getSyncableAccounts({
    minInSyncDate,
    allowedAccountEmails,
  }); // might need to update this based on lastSyncedAt

  const syncResults = await bluebird.mapSeries(
    syncableAccounts,
    async (account) => {
      const {
        id,
        tdaAccountId,
        tdaAccessToken: accessToken,
        tdaRefreshToken: refreshToken,
        tdaRefreshTokenExpiresAt: refreshTokenExpiresAt,
        lastTdaSyncedAt,
      } = account;

      const tokenInfo = {
        accessToken,
        refreshToken,
        refreshTokenExpiresAt,
      };

      const results = { accountId: id };
      let orders = [];

      try {
        if ((lastTdaSyncedAt === null || initialSync) && !lastSyncedAt) {
          // fetch YTD data and include previous year's data if less than 6 months

          if (mostRecentFriday > yearStart) {
            let year = yearStart.getFullYear();
            if (today.getMonth() - yearStart.getMonth() < MIN_DATA_MONTHS) {
              year--;
            }

            const fromEnteredTime = `${year}-01-01`;

            orders = await tdaApi.fetchOrders(
              tdaAccountId,
              { fromEnteredTime, toEnteredTime },
              tokenInfo
            );
          }
        } else {
          // fetch from the monday after the lastTdaSyncedAt date until the mostRecentFriday
          const mondayAfterLastSync = new Date(lastSyncedAt || lastTdaSyncedAt);
          const year = mondayAfterLastSync.getFullYear();
          const month = mondayAfterLastSync.getMonth() + 1;
          const date = mondayAfterLastSync.getDate();
          const fromEnteredTime = `${year}-${month < 10 ? "0" : ""}${month}-${
            date < 10 ? "0" : ""
          }${date}`;

          orders = await tdaApi.fetchOrders(
            tdaAccountId,
            { fromEnteredTime, toEnteredTime },
            tokenInfo
          );
        }

        if (orders.length) {
          const rawTrades = mapOrdersToTrades(orders);

          if (rawTrades.completedTrades.length) {
            // map the trades to db trades and bulk insert
            const trades = rawTrades.completedTrades.map(
              (rawCompletedTrade) => {
                const {
                  tradeClosedAt,
                  tradeOpenedAt,
                  securityType,
                  tradeDirectionType,
                  closeQty,
                  securitySymbol,
                  securityName,
                  closePrices,
                  openPrices,
                  underlyingSymbol,
                } = rawCompletedTrade;

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

                return {
                  accountId: id,
                  tradeOpenedAt: formatDate(tradeOpenedAt),
                  tradeClosedAt: formatDate(tradeClosedAt),
                  timeRangeType,
                  securityType,
                  tradeDirectionType,
                  quantity: closeQty,
                  securityName,
                  securitySymbol,
                  underlyingSymbol,
                  openPrice,
                  closePrice,
                  isScaledIn,
                  isScaledOut,
                  createdAt: todayFormatted,
                  updatedAt: todayFormatted,
                };
              }
            );

            if (trades.length) {
              // augment trades with underlying open & close prices
              const augmentedTrades = await augmentTradesWithUnderlyingPrices(
                trades,
                tokenInfo
              );
              results.trades = augmentedTrades;

              if (!testMode) {
                await db("tradeHistory").insert(augmentedTrades); // double check the syntax - mixed up with update
              }
            }
          }

          // handle any openTrades
          const oldOpenTrades = await db
            .select(
              "id",
              "tradeOpenedAt",
              "securitySymbol",
              "quantity",
              "openPrice",
              "isScaledIn"
            )
            .from("openTrades")
            .where({ accountId: id });

          if (oldOpenTrades.length && rawTrades.incompleteClosedTrades.length) {
            const oldOpenTradesMap = oldOpenTrades.reduce(
              (acc, oldOpenTrade) => {
                const { securitySymbol, quantity } = oldOpenTrade;
                const key = `${securitySymbol}-${quantity}`;
                let trades = acc.get(key);

                if (trades) {
                  trades.push(oldOpenTrade);
                } else {
                  trades = [oldOpenTrade];
                }

                acc.set(key, trades);

                return acc;
              },
              new Map()
            );

            const tradeInfo = rawTrades.incompleteClosedTrades.map(
              (acc, incompleteClosedTrade) => {
                const {
                  tradeClosedAt,
                  securityType,
                  tradeDirectionType,
                  closeQty,
                  securitySymbol,
                  underlyingSymbol,
                  securityName,
                  closePrices,
                } = incompleteClosedTrade;

                const key = `${securitySymbol}-${closeQty}`;
                const possibleMatches = oldOpenTradesMap.get(key);

                if (possibleMatches) {
                  // check for any trade with an earlier open date than the incompleteClosedTrade
                  const closeDate = new Date(tradeClosedAt);
                  for (let possibleMatch of possibleMatches) {
                    const {
                      tradeOpenedAt,
                      openPrice,
                      id: openTradeId,
                      isScaledIn,
                    } = possibleMatch;
                    const openDate = new Date(tradeOpenedAt);
                    if (openDate < closeDate) {
                      const timeRangeType =
                        (closeDate - openDate) / (60 * 60 * 1000) <
                        HOURS_MARKET_OPEN
                          ? "Day"
                          : "Swing";

                      const closePrice =
                        closePrices.reduce((acc, price) => acc + price, 0) /
                        closePrices.length;
                      const isScaledOut = closePrices.length > 1;

                      // TODO: refactor to function if simple
                      const trade = {
                        accountId: id,
                        tradeOpenedAt: formatDate(tradeOpenedAt),
                        tradeClosedAt: formatDate(tradeClosedAt),
                        timeRangeType,
                        securityType,
                        tradeDirectionType,
                        quantity: closeQty,
                        securityName,
                        securitySymbol,
                        underlyingSymbol,
                        openPrice,
                        closePrice,
                        isScaledIn,
                        isScaledOut,
                        createdAt: todayFormatted,
                        updatedAt: todayFormatted,
                      };

                      acc.trades.push(trade);
                      acc.openTradeDeleteIds.push(openTradeId);
                      break;
                    }
                  }
                }
                return acc;
              },
              { trades: [], openTradeDeleteIds: [] }
            );

            if (tradeInfo.trades) {
              // augment completedOpenTrades with close underlying price info
              const augmentedTrades = await augmentTradesWithUnderlyingPrices(
                tradeInfo.trades,
                tokenInfo
              );
              results.completedOpenTrades = augmentedTrades;
              results.openTradeDeleteIds = openTradeDeleteIds;

              if (!testMode) {
                await db("tradeHistory").insert(augmentedTrades);
                await db("openTrades")
                  .delete()
                  .whereIn(tradeInfo.openTradeDeleteIds); // double-check syntax
              }
            }
          }

          if (rawTrades.openTrades.length) {
            const openTrades = rawTrades.openTrades.map((rawOpenTrade) => {
              const {
                tradeOpenedAt,
                securityType,
                tradeDirectionType,
                openQty,
                securitySymbol,
                securityName,
                underlyingSymbol,
                openPrices,
              } = rawOpenTrade;

              const openPrice =
                openPrices.reduce((acc, price) => acc + price, 0) /
                openPrices.length;
              const isScaledIn = openPrices.length > 1;

              return {
                accountId: id,
                tradeOpenedAt: formatDate(tradeOpenedAt),
                securityType,
                tradeDirectionType,
                quantity: openQty,
                securityName,
                securitySymbol,
                underlyingSymbol,
                openPrice,
                isScaledIn,
                createdAt: todayFormatted,
                updatedAt: todayFormatted,
              };
            });

            const augmentedTrades = await augmentTradesWithUnderlyingPrices(
              openTrades,
              tokenInfo
            );

            results.newOpenTrades = augmentedTrades;

            if (!testMode) {
              await db("openTrades").insert(openTrades);
            }
          }
        }

        // update lastTdaSyncedAt to today
        if (!testMode) {
          await db("account")
            .update({
              lastTdaSyncedAt: todayFormatted,
              prevLastTdaSyncedAt: lastTdaSyncedAt,
            })
            .where({ tdaAccountId });
        }
      } catch (e) {
        results.error = e;
      }
      return results;
    }
  );

  console.log(syncResults.length);

  const outputInfo = syncResults.reduce(
    (acc, results) => {
      const {
        accountId,
        error,
        trades,
        completedOpenTrades,
        openTradeDeleteIds,
        newOpenTrades,
      } = results;

      if (error) {
        acc.stats.numErrors++;
      } else {
        acc.stats.numAccountsProccessed++;
        trades && (acc.stats.numNewTrades += trades.length);
        completedOpenTrades &&
          (acc.stats.numCompletedOpenTrades += completedOpenTrades.length);
        openTradeDeleteIds &&
          (acc.stats.numOpenTradeDeletes += openTradeDeleteIds.length);
        newOpenTrades && (acc.stats.numNewOpenTrades += newOpenTrades.length);
      }

      acc.resultsByAccount.set(accountId, { ...results });

      return acc;
    },
    {
      stats: {
        numAccountsProccessed: 0,
        numNewTrades: 0,
        numCompletedOpenTrades: 0,
        numOpenTradeDeletes: 0,
        numNewOpenTrades: 0,
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
