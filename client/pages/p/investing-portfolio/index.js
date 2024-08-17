import React, { useState, useEffect } from "react";
import Select from "react-select";
import { Checkbox } from "@chakra-ui/react";
import Layout from "../../../components/appV2/layout";
import SearchBox from "../../../components/app/search-box";
import BasicTable from "../../../components/app/basic-table";
import ImportTradesModal from "../../../components/app/import-trades-modal";
import LinkTradePlanModal from "../../../components/app/link-trade-plan-modal";
import usePlatformAccounts from "../../../hooks/platformAccounts";
import useTrades from "../../../hooks/trades";
import useJournal from "../../../hooks/journal";
import { formatJournalDate } from "../../../date-utils";
import { formatCurrency } from "../../../data-utils";
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

const ALL_PLATFORMS_ITEM = { label: "All Accounts", value: null };

export default function InvestingPortfolio() {
  const [isAcctRequiredModalOpen, setAcctRequiredOpen] = useState(false);
  const [isImportModalOpen, setImportModalOpen] = useState(false);
  const [tradePlans, setTradePlans] = useState([]);
  const [journalItems, setJournalItems] = useState({});
  const [tradeInfo, setTradeInfo] = useState(null);
  const [platformAccounts, setPlatformAccounts] = useState([]);
  const [selectedPlatformItem, setSelectedPlatformItem] =
    useState(ALL_PLATFORMS_ITEM);
  const [trades, setTrades] = useState([]);
  const [importLogs, setImportLogs] = useState([]);
  const [showUnlinkedTrades, setShowUnlinkedTrades] = useState(true);
  const [showLinkedTrades, setShowLinkedTrades] = useState(false);
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
      pnl: formatCurrency(
        trade.pnl || parseFloat(trade.closePrice) - parseFloat(trade.openPrice)
      ),
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

  if (!showLinkedTrades) {
    data = data.filter((trade) => !trade.tradePlan);
  }

  if (!showUnlinkedTrades) {
    data = data.filter((trade) => !!trade.tradePlan);
  }

  if (debouncedSearchString) {
    console.log("debouncedSearchString", debouncedSearchString);
    data = data.filter(({ securityName }) =>
      securityName.toLowerCase().includes(debouncedSearchString.toLowerCase())
    );
  }

  const platformAccountItems = platformAccounts.map(
    ({ accountName, id, platform: { name } }) => ({
      label: `${name} ${accountName}`,
      value: id,
    })
  );

  const extendedPlatformAccountItems = [
    ALL_PLATFORMS_ITEM,
    ...platformAccountItems,
  ];

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

  async function loadTradeHistory(platformAccountId = null) {
    try {
      const resp = await fetchTradeHistory({
        platformAccountsOnly: true,
        includeTradePlans: true,
        platformAccountId,
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
          loadTradeHistory(selectedPlatformItem.value);
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

  function handleAccountChange(account) {
    setSelectedPlatformItem(account);
    setLoading(true);
    loadTradeHistory(account.value);
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
  }, [searchString]);

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
                  <div className="flex justify-center">
                    <div className="h-16 w-16 rounded-full overflow-hidden mr-2">
                      <img src="/images/portfolio-example.jpg" />
                    </div>
                    <h2 className="mb-0 text-2xl self-center">
                      My Investing Portfolio
                    </h2>
                  </div>
                </div>
              </div>
              <div className="w-full h-full">
                <div className=" w-[90%] mx-auto border border-gray-2 h-98 mt-2 flex flex-col items-center">
                  <div className="flex w-full justify-between">
                  <h4 className="ml-8 mt-3">
                    Active Positions
                  </h4>

                  <button
                      className="rounded-full bg-purple-800 text-white px-4 py-1 mt-2 mr-8"
                    >
                      Sync Investments
                    </button>
                    </div>
                  <div className="w-[90%] my-3 h-36 border border-gray-2 flex flex-col px-2 py-3">
                    <div className="flex">
                    <div className="mr-2">
                      <img src="/images/stocks/TSLA.png" />
                    </div>
                    <div className="flex flex-col">
                        <h5>
                          Tesla Motors
                        </h5>
                        <p>TSLA</p>
                    </div>
                    <div className="ml-2 flex grow justify-between">
                    <div className="flex flex-col mx-2">
                        <h5>
                         Qty 
                        </h5>
                        <p>100 Shares</p>
                    </div>
                    <div className="flex flex-col mx-2">
                        <h5>
                         Price 
                        </h5>
                        <p>$216</p>
                    </div>
                    <div className="flex flex-col mx-2">
                        <h5>
                         Market Value 
                        </h5>
                        <p>$21.6K</p>
                    </div>
                    <div className="flex flex-col mx-2">
                        <h5>
                         Gain/Loss
                        </h5>
                        <p className="text-green-600">$2.1K</p>
                    </div>
                    <div className="flex flex-col mx-2">
                        <h5>
                         ROI  
                        </h5>
                        <p className="text-green-600">10%</p>
                    </div>
                    <div className="flex flex-col mx-2">
                        <h5>
                         Hold Time  
                        </h5>
                        <p>3 Months</p>
                    </div>
                    <div className="flex flex-col mx-2">
                        <h5>
                         Cost Basis
                        </h5>
                        <p>$19.4K</p>
                    </div>
                    <div className="flex flex-col mx-2">
                        <h5>
                         Dividends
                        </h5>
                        <p>N/A</p>
                    </div>
                    </div>
                    </div>
                    <div>
                    <button
                      className="rounded-full border-[1px] border-purple-800 text-purple-800 px-4 py-1 mt-2 mr-8"
                    >
                      View Transactions
                    </button>
                    </div>
                  </div>

                  <div className="w-[90%] my-3 h-36 border border-gray-2 flex flex-col px-2 py-3">
                    <div className="flex">
                    <div className="mr-2">
                      <img src="/images/stocks/AMZN.png" />
                    </div>
                    <div className="flex flex-col">
                        <h5>
                          Amazon Inc.
                        </h5>
                        <p>AMZN</p>
                    </div>
                    <div className="ml-2 flex grow justify-between">
                    <div className="flex flex-col mx-2">
                        <h5>
                         Qty 
                        </h5>
                        <p>70 Shares</p>
                    </div>
                    <div className="flex flex-col mx-2">
                        <h5>
                         Price 
                        </h5>
                        <p>$177</p>
                    </div>
                    <div className="flex flex-col mx-2">
                        <h5>
                         Market Value 
                        </h5>
                        <p>$17.7K</p>
                    </div>
                    <div className="flex flex-col mx-2">
                        <h5>
                         Gain/Loss
                        </h5>
                        <p className="text-green-600">$5.3K</p>
                    </div>
                    <div className="flex flex-col mx-2">
                        <h5>
                         ROI  
                        </h5>
                        <p className="text-green-600">30%</p>
                    </div>
                    <div className="flex flex-col mx-2">
                        <h5>
                         Hold Time  
                        </h5>
                        <p>1 Year</p>
                    </div>
                    <div className="flex flex-col mx-2">
                        <h5>
                         Cost Basis
                        </h5>
                        <p>$12.3K</p>
                    </div>
                    <div className="flex flex-col mx-2">
                        <h5>
                         Dividends
                        </h5>
                        <p>N/A</p>
                    </div>
                    </div>
                    </div>
                    <div>
                    <button
                      className="rounded-full border-[1px] border-purple-800 text-purple-800 px-4 py-1 mt-2 mr-8"
                    >
                      View Transactions
                    </button>
                    </div>
                  </div>

                  <div className="w-[90%] my-3 h-36 border border-gray-2 flex flex-col px-2 py-3">
                    <div className="flex">
                    <div className="mr-2">
                      <img src="/images/stocks/SPY.png" />
                    </div>
                    <div className="flex flex-col">
                        <h5>
                         S&P 500 ETF
                        </h5>
                        <p>SPY</p>
                    </div>
                    <div className="ml-2 flex grow justify-between">
                    <div className="flex flex-col mx-2">
                        <h5>
                         Qty 
                        </h5>
                        <p>20 Shares</p>
                    </div>
                    <div className="flex flex-col mx-2">
                        <h5>
                         Price 
                        </h5>
                        <p>$554</p>
                    </div>
                    <div className="flex flex-col mx-2">
                        <h5>
                         Market Value 
                        </h5>
                        <p>$11K</p>
                    </div>
                    <div className="flex flex-col mx-2">
                        <h5>
                         Gain/Loss
                        </h5>
                        <p className="text-green-600">$2.4K</p>
                    </div>
                    <div className="flex flex-col mx-2">
                        <h5>
                         ROI  
                        </h5>
                        <p className="text-green-600">22%</p>
                    </div>
                    <div className="flex flex-col mx-2">
                        <h5>
                         Hold Time  
                        </h5>
                        <p>1 Year, 11 Months</p>
                    </div>
                    <div className="flex flex-col mx-2">
                        <h5>
                         Cost Basis
                        </h5>
                        <p>$8.5K</p>
                    </div>
                    <div className="flex flex-col mx-2">
                        <h5>
                         Dividends
                        </h5>
                        <p>N/A</p>
                    </div>
                    </div>
                    </div>
                    <div>
                    <button
                      className="rounded-full border-[1px] border-purple-800 text-purple-800 px-4 py-1 mt-2 mr-8"
                    >
                      View Transactions
                    </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </div>
  );
}
