import React, { useState, useEffect } from "react";
import Layout from "../../../components/app/layout";
import SearchBox from "../../../components/app/search-box";
import BasicTable from "../../../components/app/basic-table";
import ImportTradesModal from "../../../components/app/import-trades-modal";
import LinkTradePlanModal from "../../../components/app/link-trade-plan-modal";
import usePlatformAccounts from "../../../hooks/platformAccounts";
import useTrades from "../../../hooks/trades";
import useJournal from "../../../hooks/journal";
import { formatJournalDate } from "../../../date-utils";
import Loader from "../../../components/loader";
import TradingAccountRequiredModal from "../../../components/app/trading-account-required-modal";

const testData = [
  {
    id: 1,
    tradeOpenedAt: "2021-12-29T00:13:52.000Z",
    tradeClosedAt: "2021-12-30T00:04:55.000Z",
    timeRangeType: "Swing",
    securityType: "Option",
    tradeDirectionType: "Long",
    quantity: 10,
    securitySymbol: "SPY_123121P478",
    securityName: "SPY Dec 31 2021 478.0 Put",
    openPrice: "2.79",
    closePrice: "2.09",
    risk: null,
    reward: null,
    notes: null,
    isMilestone: 0,
    isScaledIn: 0,
    isScaledOut: 0,
    catalystId: null,
    setupId: null,
    platform: "TD Ameritrade",
  },
  {
    id: 2,
    tradeOpenedAt: "2021-12-28T21:49:29.000Z",
    tradeClosedAt: "2021-12-28T21:50:38.000Z",
    timeRangeType: "Day",
    securityType: "Option",
    tradeDirectionType: "Long",
    quantity: 1,
    securitySymbol: "SPY_122921C477",
    securityName: "SPY Dec 29 2021 477.0 Call",
    openPrice: "2.09",
    closePrice: "2.16",
    risk: null,
    reward: null,
    notes: null,
    isMilestone: 0,
    isScaledIn: 0,
    isScaledOut: 0,
    catalystId: null,
    setupId: null,
    platform: "TD Ameritrade",
  },
  {
    id: 3,
    tradeOpenedAt: "2021-12-28T21:44:03.000Z",
    tradeClosedAt: "2021-12-28T21:47:03.000Z",
    timeRangeType: "Day",
    securityType: "Option",
    tradeDirectionType: "Long",
    quantity: 1,
    securitySymbol: "SPY_122921C477",
    securityName: "SPY Dec 29 2021 477.0 Call",
    openPrice: "2.00",
    closePrice: "2.03",
    risk: null,
    reward: null,
    notes: null,
    isMilestone: 0,
    isScaledIn: 0,
    isScaledOut: 0,
    catalystId: null,
    setupId: null,
    platform: "TD Ameritrade",
  },
  {
    id: 4,
    tradeOpenedAt: "2021-12-28T21:42:02.000Z",
    tradeClosedAt: "2021-12-28T21:42:17.000Z",
    timeRangeType: "Day",
    securityType: "Option",
    tradeDirectionType: "Long",
    quantity: 1,
    securitySymbol: "SPY_122921P479",
    securityName: "SPY Dec 29 2021 479.0 Put",
    openPrice: "2.06",
    closePrice: "2.17",
    risk: null,
    reward: null,
    notes: null,
    isMilestone: 0,
    isScaledIn: 0,
    isScaledOut: 0,
    catalystId: null,
    setupId: null,
    platform: "TD Ameritrade",
  },
  {
    id: 5,
    tradeOpenedAt: "2021-12-28T21:39:31.000Z",
    tradeClosedAt: "2021-12-28T21:40:15.000Z",
    timeRangeType: "Day",
    securityType: "Option",
    tradeDirectionType: "Long",
    quantity: 1,
    securitySymbol: "SPY_122921P479",
    securityName: "SPY Dec 29 2021 479.0 Put",
    openPrice: "2.11",
    closePrice: "2.12",
    risk: null,
    reward: null,
    notes: null,
    isMilestone: 0,
    isScaledIn: 0,
    isScaledOut: 0,
    catalystId: null,
    setupId: null,
    platform: "TD Ameritrade",
  },
  {
    id: 6,
    tradeOpenedAt: "2021-12-28T21:23:13.000Z",
    tradeClosedAt: "2021-12-28T21:25:55.000Z",
    timeRangeType: "Day",
    securityType: "Option",
    tradeDirectionType: "Long",
    quantity: 1,
    securitySymbol: "SPY_122921P478",
    securityName: "SPY Dec 29 2021 478.0 Put",
    openPrice: "1.74",
    closePrice: "1.74",
    risk: null,
    reward: null,
    notes: null,
    isMilestone: 0,
    isScaledIn: 0,
    isScaledOut: 0,
    catalystId: null,
    setupId: null,
    platform: "TD Ameritrade",
  },
  {
    id: 7,
    tradeOpenedAt: "2021-12-28T21:19:09.000Z",
    tradeClosedAt: "2021-12-28T21:20:04.000Z",
    timeRangeType: "Day",
    securityType: "Option",
    tradeDirectionType: "Long",
    quantity: 1,
    securitySymbol: "SPY_122921P478",
    securityName: "SPY Dec 29 2021 478.0 Put",
    openPrice: "1.92",
    closePrice: "2.00",
    risk: null,
    reward: null,
    notes: null,
    isMilestone: 0,
    isScaledIn: 0,
    isScaledOut: 0,
    catalystId: null,
    setupId: null,
    platform: "TD Ameritrade",
  },
  {
    id: 8,
    tradeOpenedAt: "2021-12-28T21:14:40.000Z",
    tradeClosedAt: "2021-12-28T21:16:17.000Z",
    timeRangeType: "Day",
    securityType: "Option",
    tradeDirectionType: "Long",
    quantity: 1,
    securitySymbol: "SPY_122921P478",
    securityName: "SPY Dec 29 2021 478.0 Put",
    openPrice: "1.84",
    closePrice: "1.84",
    risk: null,
    reward: null,
    notes: null,
    isMilestone: 0,
    isScaledIn: 0,
    isScaledOut: 0,
    catalystId: null,
    setupId: null,
    platform: "TD Ameritrade",
  },
  {
    id: 9,
    tradeOpenedAt: "2021-12-28T21:10:08.000Z",
    tradeClosedAt: "2021-12-28T21:12:45.000Z",
    timeRangeType: "Day",
    securityType: "Option",
    tradeDirectionType: "Long",
    quantity: 1,
    securitySymbol: "SPY_122921P478",
    securityName: "SPY Dec 29 2021 478.0 Put",
    openPrice: "1.91",
    closePrice: "1.63",
    risk: null,
    reward: null,
    notes: null,
    isMilestone: 0,
    isScaledIn: 0,
    isScaledOut: 0,
    catalystId: null,
    setupId: null,
    platform: "TD Ameritrade",
  },
  {
    id: 10,
    tradeOpenedAt: "2021-12-27T20:41:06.000Z",
    tradeClosedAt: "2021-12-27T20:43:00.000Z",
    timeRangeType: "Day",
    securityType: "Option",
    tradeDirectionType: "Long",
    quantity: 1,
    securitySymbol: "SPY_122721C472",
    securityName: "SPY Dec 27 2021 472.0 Call",
    openPrice: "1.68",
    closePrice: "1.77",
    risk: null,
    reward: null,
    notes: null,
    isMilestone: 0,
    isScaledIn: 0,
    isScaledOut: 0,
    catalystId: null,
    setupId: null,
    platform: "TD Ameritrade",
  },
  {
    id: 11,
    tradeOpenedAt: "2021-12-17T01:09:36.000Z",
    tradeClosedAt: "2021-12-17T21:18:23.000Z",
    timeRangeType: "Swing",
    securityType: "Option",
    tradeDirectionType: "Long",
    quantity: 1,
    securitySymbol: "SPY_121721P468",
    securityName: "SPY Dec 17 2021 468.0 Put",
    openPrice: "3.11",
    closePrice: "9.70",
    risk: null,
    reward: null,
    notes: null,
    isMilestone: 0,
    isScaledIn: 0,
    isScaledOut: 0,
    catalystId: null,
    setupId: null,
    platform: null,
  },
  {
    id: 12,
    tradeOpenedAt: "2021-12-15T00:45:16.000Z",
    tradeClosedAt: "2021-12-16T22:05:47.000Z",
    timeRangeType: "Swing",
    securityType: "Option",
    tradeDirectionType: "Long",
    quantity: 1,
    securitySymbol: "SPY_121721P461",
    securityName: "SPY Dec 17 2021 461.0 Put",
    openPrice: "4.72",
    closePrice: "0.38",
    risk: null,
    reward: null,
    notes: null,
    isMilestone: 0,
    isScaledIn: 0,
    isScaledOut: 0,
    catalystId: null,
    setupId: null,
    platform: null,
  },
];

export default function Trades() {
  const [isAcctRequiredModalOpen, setAcctRequiredOpen] = useState(false);
  const [isImportModalOpen, setImportModalOpen] = useState(false);
  const [tradePlans, setTradePlans] = useState([]);
  const [journalItems, setJournalItems] = useState({});
  const [tradeInfo, setTradeInfo] = useState(null);
  const [platformAccounts, setPlatformAccounts] = useState([]);
  const [trades, setTrades] = useState([]);
  const [importLogs, setImportLogs] = useState([]);
  const [searchString, setSearchString] = useState("");
  const [debouncedSearchString, setDebouncedSearchString] = useState("");
  const [loading, setLoading] = useState(true);

  const { fetchPlatformAccounts } = usePlatformAccounts();
  const {
    uploadTradeHistoryCSV,
    fetchTradeHistory,
    fetchImportLogs,
    linkTradePlanTradeResult,
    unlinkTradePlanTradeResult,
  } = useTrades();
  const { journalTags, fetchJournalEntries, fetchJournalItems } = useJournal();

  const columns = [
    {
      Header: "Id",
      accessor: "id",
    },
    {
      Header: "Symbol",
      accessor: "securityName",
      sticky: "left",
    },
    {
      Header: "Direction",
      accessor: "tradeDirectionType",
    },
    {
      Header: "Opened On",
      accessor: "tradeOpenedAt",
    },
    {
      Header: "Closed On",
      accessor: "tradeClosedAt",
    },
    {
      Header: "Qty",
      accessor: "quantity",
    },
    {
      Header: "PnL",
      accessor: "pnl",
    },
    {
      Header: "Open Price",
      accessor: "openPrice",
    },
    {
      Header: "Close Price",
      accessor: "closePrice",
    },
    {
      Header: "Trading Account",
      accessor: "platformAccount",
    },
    {
      Header: "Trade Plan",
      accessor: "tradePlan",
      sticky: "right",
      Cell: ({ cell }) => {
        const { tradePlan } = cell.row.values;

        return (
          <button
            className="rounded-full bg-purple-800 text-sm text-white px-2 py-1"
            onClick={() => setTradeInfo(cell.row.values)}
          >
            {tradePlan ? "View" : "Add"}
          </button>
        );
      },
    },
  ];

  let data = trades.map((trade) => {
    const platformAccount = platformAccounts.find(
      ({ id }) => id === trade.platformAccountId
    );
    return {
      ...trade,
      tradeOpenedAt: formatJournalDate(trade.tradeOpenedAt),
      tradeClosedAt: formatJournalDate(trade.tradeClosedAt),
      pnl:
        trade.pnl ||
        (parseFloat(trade.closePrice) - parseFloat(trade.openPrice)).toFixed(2),
      platformAccount: platformAccount
        ? `${platformAccount.platform.name} ${platformAccount.accountName}`
        : "",
    };
  });

  // sort linked trade plans to top
  data = data.sort((a, b) => {
    if (b.tradePlan) {
      return 1;
    } else if (a.tradePlan) {
      return -1;
    }
    return 0;
  });

  if (debouncedSearchString) {
    console.log("debouncedSearchString", debouncedSearchString);
    data = data.filter(({ securityName }) =>
      securityName.toLowerCase().includes(debouncedSearchString.toLowerCase())
    );
  }

  async function loadPlatformAccounts() {
    try {
      const resp = await fetchPlatformAccounts();
      console.log("platformAccounts resp", resp);
      if (!resp.platformAccounts?.length) {
        setAcctRequiredOpen(true);
      }
      setPlatformAccounts(resp.platformAccounts);
    } catch (e) {
      console.error(e); // show error/alert
    }
  }

  async function loadTradeHistory() {
    try {
      const resp = await fetchTradeHistory({
        platformAccountsOnly: true,
        includeTradePlans: true,
      });
      console.log("tradeHistory resp", resp);
      setTrades(resp.tradeHistory);
      setLoading(false);
    } catch (e) {
      console.error(e); // show error/alert
    }
  }

  async function loadImportLogs() {
    try {
      const resp = await fetchImportLogs();
      console.log("importLogs resp", resp);
      setImportLogs(resp.importLogs);
    } catch (e) {
      console.error(e); // show error/alert
    }
  }

  async function loadTradePlanJournalEntries() {
    try {
      const tagId = journalTags.find(
        ({ label }) => label === "Trade Plans"
      ).value;
      const resp = await fetchJournalEntries({ tagId });
      console.log("journalEntries resp", resp);
      const tradePlans = resp.journalEntries.map(
        ({ updatedAt, tradePlan }) => ({ ...tradePlan, updatedAt })
      );
      setTradePlans(tradePlans);
    } catch (e) {
      console.error(e); // show error/alert
    }
  }

  async function loadJournalItems() {
    try {
      const resp = await fetchJournalItems();
      console.log("journalItems resp", resp);
      setJournalItems(resp.journalItems);
    } catch (e) {
      console.error(e); // show error/alert
    }
  }

  async function handleImportTrades({ action, formData }) {
    try {
      if (action === "upload") {
        console.log("uploading csv", formData);

        const resp = await uploadTradeHistoryCSV(formData);
        console.log("csvUpload response", resp);
        console.log("csvUpload response success", resp.success);
        // if successful, refetch tradeHistory data and populate store
        if (resp.success) {
          console.log("csvUpload success. loading tradehistory");
          setImportLogs([resp.importLog, ...importLogs]);
          loadTradeHistory();
        }
      }
    } catch (e) {
      console.error(e); // show error/alert
    }
    setImportModalOpen(false);
  }

  async function handleTradePlanModalSubmit({ tradePlanId, tradeId }) {
    if (tradeInfo?.tradePlan) {
      const resp = await unlinkTradePlanTradeResult(tradePlanId, tradeId);
      console.log("unlinkTradePlanTradeResult", resp);

      if (resp.deleted) {
        // remove trade plan from trades
        const tradeIdx = trades.findIndex(({ id }) => id === resp.tradeId);
        const { tradePlan, ...tradeData } = trades[tradeIdx];
        const updatedTrade = { ...tradeData };

        const updatedTrades = [
          ...trades.slice(0, tradeIdx),
          updatedTrade,
          ...trades.slice(tradeIdx + 1),
        ];
        setTrades(updatedTrades);
      } else if (resp.error) {
        console.error(resp.error);
      }
    } else {
      const resp = await linkTradePlanTradeResult(tradePlanId, tradeId);
      console.log("linkTradePlanTradeResult", resp);

      if (resp.error) {
        console.error(resp.error);
      } else {
        const { tradePlanTradeResultLink } = resp;

        // find the tradePlan and update trades
        const tradeIdx = trades.findIndex(
          ({ id }) => id === tradePlanTradeResultLink.tradeId
        );
        const trade = trades[tradeIdx];
        const tradePlan = tradePlans.find(
          ({ id }) => id === tradePlanTradeResultLink.tradePlanId
        );
        const updatedTrade = { ...trade, tradePlan };

        const updatedTrades = [
          ...trades.slice(0, tradeIdx),
          updatedTrade,
          ...trades.slice(tradeIdx + 1),
        ];
        setTrades(updatedTrades);
      }
    }
    setTradeInfo(null);
  }

  useEffect(() => {
    loadTradeHistory();
    loadPlatformAccounts();
    loadImportLogs();
    loadTradePlanJournalEntries();
    loadJournalItems();
  }, []);

  useEffect(() => {
    const delayInputTimeoutId = setTimeout(() => {
      setDebouncedSearchString(searchString);
    }, 500);
    return () => clearTimeout(delayInputTimeoutId);
  }, [searchString, 500]);

  let tradePlanOptions = tradePlans.map(
    ({
      id,
      securitySymbol,
      tradeDirectionType,
      planType,
      entry,
      exit,
      stopLoss,
      priceTarget1,
      priceTarget2,
      priceTarget3,
      hypothesis,
      updatedAt,
    }) => ({
      label: `${securitySymbol} ${tradeDirectionType}\nEntry @ ${entry}. ${
        exit && planType === "Simple" ? `Exit @ ${exit}.` : ""
      } ${
        priceTarget1 && planType === "Advanced"
          ? `Price Target 1 @ ${priceTarget1}.`
          : ""
      } ${
        priceTarget2 && planType === "Advanced"
          ? `Price Target 2 @ ${priceTarget2}.`
          : ""
      } ${
        priceTarget3 && planType === "Advanced"
          ? `Price Target 3 @ ${priceTarget3}.`
          : ""
      } Stop Loss @ ${stopLoss}\nPlan updated ${formatJournalDate(updatedAt)} `,
      value: id,
    })
  );

  return (
    <div>
      <Layout>
        <div className="h-full">
          <div className="py-4 h-full flex">
            <div className="ml-5 w-11/12 h-full flex flex-col border-x border-y border-gray-300 bg-white pb-4 mx-auto overflow-auto">
              <div>
                <div className="pt-2 text-center relative">
                  <h2 className="mb-0 text-2xl self-center">Trades</h2>
                </div>
                <div className="flex justify-between w-[90%] mx-auto">
                  <div>
                    {importLogs.length ? (
                      <span className="text-sm">
                        Last Updated
                        <br />{" "}
                        <i> {formatJournalDate(importLogs[0].createdAt)}</i>
                      </span>
                    ) : (
                      ""
                    )}
                  </div>
                  <div>
                    {/* TODO: Refresh not in scope for MVP */}
                    {/* <button className="mr-5 rounded-full bg-purple-800 text-white px-4 py-1">
                  Refresh
                </button> */}
                    <button
                      className="rounded-full bg-purple-800 text-white px-4 py-1"
                      onClick={() => setImportModalOpen(true)}
                    >
                      Import
                    </button>
                  </div>
                </div>
                <hr className="w-[90%] border-t border-gray-300 mx-auto" />
              </div>
              <div className="w-full h-full">
                {trades.length ? (
                  <div className="flex justify-end">
                    <SearchBox
                      className="mr-8"
                      placeholder={"Search Symbol"}
                      onSearch={setSearchString}
                    />
                  </div>
                ) : null}
                {loading && <Loader />}
                {trades.length && data.length ? (
                  <div className="mx-auto mt-4 max-w-[90%]">
                    <BasicTable
                      className="h-[50vh] border-b"
                      columns={columns}
                      data={data}
                    />
                  </div>
                ) : trades.length && !data.length ? (
                  <div className="max-w-[90%] mx-auto">
                    <p>No search results</p>
                  </div>
                ) : (
                  <div className="max-w-[90%] mx-auto">
                    <p>No trades uploaded yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Layout>
      <ImportTradesModal
        isOpen={isImportModalOpen}
        onClose={() => setImportModalOpen(false)}
        platformAccountItems={platformAccounts.map(
          ({ accountName, id, platform: { name } }) => ({
            label: `${name} ${accountName}`,
            value: id,
          })
        )}
        onSubmit={handleImportTrades}
      />
      <LinkTradePlanModal
        isOpen={!!tradeInfo}
        tradeInfo={tradeInfo}
        tradePlanOptions={tradePlanOptions}
        tradePlanItems={journalItems}
        onClose={() => setTradeInfo(null)}
        onSubmit={handleTradePlanModalSubmit}
      />
      <TradingAccountRequiredModal
        body="To import and view trades/investments, create an account first"
        isOpen={isAcctRequiredModalOpen}
      />
    </div>
  );
}
