import React, { useState, useEffect, useRef } from "react";
import Select from "react-select";
import { DateTime } from "luxon";
import { Checkbox } from "@chakra-ui/react";
import Layout from "../../../components/appV2/layout";
import PieChart2 from "../../../components/appV2/pie-chart-2";
import BarChart2 from "../../../components/appV2/bar-chart-2";
import { Switch } from "@chakra-ui/react";
import Pill from "../../../components/appV2/pill";
import Tooltip from "../../../components/appV2/tooltip";
import DatePicker from "react-datepicker";
import usePlatformAccounts from "../../../hooks/platformAccounts";
import useInsights from "../../../hooks/insights";
import { formatJournalDate } from "../../../date-utils";
import Loader from "../../../components/loader";
import PortfolioRecommendationsModal from "../../../components/appV2/portfolio-recommendations-modal";
import { formatCurrency } from "../../../data-utils";
import {
  holdingsData,
  roiData,
  earningsData,
  recommendationsData,
} from "../../../testPortfolioData";

const MAX_FINSTRUMENTS = 3;
const MAX_STRATEGIES = 3;
const MAX_TRADES = 3;

const platformOptions = [
  { label: "TD Ameritrade", value: 0 },
  { label: "Ninja Trader", value: 1 },
  { label: "All", value: 2 },
];

const tradeBalanceData = [
  { x: "2024-01-08", y: 10000 },
  { x: "2024-01-09", y: 8000 },
  { x: "2024-01-10", y: 12000 },
  { x: "2024-01-11", y: 13000 },
  { x: "2024-01-12", y: 11000 },
  { x: "2024-01-13", y: 10500 },
  { x: "2024-01-14", y: 15000 },
];

const tradeQualityHighData = [
  { x: "2024-01-08", y: 5 },
  { x: "2024-01-09", y: 2 },
  { x: "2024-01-10", y: 4 },
  { x: "2024-01-11", y: 5 },
  { x: "2024-01-12", y: 1 },
  { x: "2024-01-13", y: 2 },
  { x: "2024-01-14", y: 3 },
];

const tradeQualityLowData = [
  { x: "2024-01-08", y: 1 },
  { x: "2024-01-09", y: 3 },
  { x: "2024-01-10", y: 2 },
  { x: "2024-01-11", y: 1 },
  { x: "2024-01-12", y: 7 },
  { x: "2024-01-13", y: 4 },
  { x: "2024-01-14", y: 2 },
];

const tradeRevengeData = [
  { x: "2024-01-08", y: 0 },
  { x: "2024-01-09", y: 1 },
  { x: "2024-01-10", y: 2 },
  { x: "2024-01-11", y: 0 },
  { x: "2024-01-12", y: 6 },
  { x: "2024-01-13", y: 2 },
  { x: "2024-01-14", y: 0 },
];

const tradeProfitData = [
  { x: "2024-01-08", y: 5 },
  { x: "2024-01-09", y: 3 },
  { x: "2024-01-10", y: 4 },
  { x: "2024-01-11", y: 5 },
  { x: "2024-01-12", y: 4 },
  { x: "2024-01-13", y: 2 },
  { x: "2024-01-14", y: 5 },
];

const tradeLossData = [
  { x: "2024-01-08", y: 1 },
  { x: "2024-01-09", y: 2 },
  { x: "2024-01-10", y: 2 },
  { x: "2024-01-11", y: 1 },
  { x: "2024-01-12", y: 4 },
  { x: "2024-01-13", y: 4 },
  { x: "2024-01-14", y: 0 },
];

const winLossRateData = [
  // clock-wise
  { x: "Loss Rate", y: 25, color: "tomato" },
  { x: "Win Rate", y: 75, color: "green" },
];

const winLossAmountData = [
  // clock-wise
  { x: "Loss Ratio", y: 1, color: "tomato" },
  { x: "Win Ratio", y: 2, color: "green" },
];

const topWinningFinstruments = [
  // clock-wise
  { x: "NG", y: 1 },
  { x: "NQ", y: 1.5 },
  { x: "ES", y: 2 },
];

const topLosingFinstruments = [
  // clock-wise
  { x: "MCL", y: 1 },
  { x: "TGT", y: 1.5 },
  { x: "FCEL", y: 2 },
];

const topWinningStrategiesData = [
  // clock-wise
  { x: "Bullish Engulfing Candle", y: 1 },
  { x: "Gap Up", y: 1.5 },
  { x: "Supply & Demand Short", y: 2 },
];

const topLosingStrategiesData = [
  // clock-wise
  { x: "ABCD", y: 1 },
  { x: "Gap Down", y: 1.5 },
  { x: "Head & Shoulders", y: 2 },
];

const tradeColumns = [
  {
    Header: "Symbol",
    accessor: "securityName",
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
    Header: "PnL",
    accessor: "pnl",
  },
];

let topLosingTradesFixtures = [
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
];

let topWinningTradesFixtures = [
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
];

const milestonesColumns = [
  {
    Header: "Milestone",
    accessor: "milestone",
  },
  {
    Header: "Reached On",
    accessor: "reachedOn",
  },
];

const milestones = [
  {
    milestone: "Completed InvestiTrade Live Traders Training!",
    reachedOn: formatJournalDate("2023-12-07"),
  },
];

const improvementAreaColumns = [
  {
    Header: "Action",
    accessor: "action",
  },
  {
    Header: "Status",
    accessor: "status",
  },
];

const improvementAreas = [
  { action: "Start sticking to my trade plans", status: "In Progress" },
  { action: "Use automated stops (OCO)", status: "Done" },
  {
    action: "Wait for confirmation",
    status: "Not Yet Started",
  },
];

const autogenWaysToImprove = [
  { id: 1, action: "Plan more probable exits" },
  { id: 2, action: "Reduce risk amount per trade to a comfortable amount" },
  {
    id: 3,
    action: "Increase account size to reduce risk amount per trade to 2%",
  },
  { id: 4, action: "Reduce avg. number of revenge trades" },
  { id: 5, action: "Reduce avg. number of low quality trades" },
  // { id: 6, action: "Increase avg. number of high quality trades" },
  // { id: 7, action: "Increase your win/loss ratio to 3:1" },
];

const appetites = [
  { label: "Large", value: 1 },
  { label: "Medium", value: 2 },
  { label: "Small", value: 3 },
];

const riskTolerances = [
  { label: "Low", value: 1 },
  { label: "Medium", value: 2 },
  { label: "High", value: 3 },
];

function getDateRange(timeframeId) {
  let startDate = null;
  let endDate = DateTime.now();

  switch (timeframeId) {
    case 1:
      startDate = endDate.minus({ days: 1 }).startOf("day");
      break;
    case 2:
      startDate = endDate.minus({ weeks: 1 }).startOf("day");
      break;
    case 3:
      startDate = endDate.minus({ months: 1 }).startOf("day");
      break;
    case 4:
      startDate = endDate.minus({ quarters: 1 }).startOf("day");
      break;
    case 5:
      startDate = endDate.minus({ years: 1 }).startOf("day");
      break;
    default:
      endDate = null;
      break;
  }

  return { startDate, endDate };
}

function formatPnl(pnl) {
  if (pnl < 0) {
    return `-$${Math.abs(pnl).toFixed(2)}`;
  }

  return `$${pnl.toFixed(2)}`;
}

function calcImprovementAreaStatus(startDate, endDate) {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (start > now) {
    return "Not yet started";
  }

  if (!endDate || (now >= start && now <= end)) {
    return "In progress";
  }

  return "Done";
}

export default function PortfolioInsights() {
  const [platformAccounts, setPlatformAccounts] = useState([]);
  const [platformAccountItems, setPlatformAccountItems] = useState([]);
  const [selectedPlatformItem, setSelectedPlatformItem] = useState(null);
  const [insights, setInsights] = useState(null);
  const [timeframeId, setTimeframeId] = useState(6);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showFees, setShowFees] = useState(false);
  const [showRecommendationsModal, setShowRecommendationsModal] =
    useState(false);
  const recommendationsRef = useRef(null);

  const { fetchPlatformAccounts } = usePlatformAccounts();
  const { fetchPlatformInsights } = useInsights();

  function handlePillClick({ id }) {
    setTimeframeId(id);
    const { startDate, endDate } = getDateRange(id);
    const params = {
      fromDate: startDate?.toFormat("yyyy-MM-dd"),
      toDate: endDate?.toFormat("yyyy-MM-dd"),
    };

    if (!selectedPlatformItem.value) {
      params.allAccounts = "true";
    } else {
      params.platformAccountId = selectedPlatformItem.value;
    }
    loadInsights(params);
  }

  function handleAccountChange(account) {
    setSelectedPlatformItem(account);

    const { startDate, endDate } = getDateRange(timeframeId);
    const params = {
      fromDate: startDate?.toFormat("yyyy-MM-dd"),
      toDate: endDate?.toFormat("yyyy-MM-dd"),
    };

    console.log("loading insights");
    if (!account.value) {
      params.allAccounts = "true";
    } else {
      params.platformAccountId = account.value;
    }
    loadInsights(params);
  }

  function handleCustomDatesClick() {
    const params = {
      fromDate: DateTime.fromJSDate(fromDate).toFormat("yyyy-MM-dd"),
      toDate: DateTime.fromJSDate(toDate).toFormat("yyyy-MM-dd"),
    };

    if (!selectedPlatformItem.value) {
      params.allAccounts = "true";
    } else {
      params.platformAccountId = selectedPlatformItem.value;
    }
    loadInsights(params);
  }

  async function loadPlatformAccounts() {
    try {
      const resp = await fetchPlatformAccounts();
      console.log("platformAccounts resp", resp);
      setPlatformAccounts(resp.platformAccounts);
      const items = resp.platformAccounts.map(
        ({ accountName, id, platform: { name } }) => ({
          label: `${name} ${accountName}`,
          value: id,
        })
      );

      setPlatformAccountItems([...items, { label: "All", value: null }]);
      setSelectedPlatformItem(items[0]);

      // TODO: call loadInsights()
    } catch (e) {
      console.error(e); // show error/alert
    }
  }

  async function loadInsights(params) {
    try {
      setLoading(true);
      const resp = await fetchPlatformInsights(params);

      console.log("insights resp", resp);

      setInsights(resp.insights);
      setLoading(false);
    } catch (e) {
      console.error(e); // show error/alert
    }
  }

  function scrollToRecommendations() {
    if (recommendationsRef.current) {
      recommendationsRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }

  useEffect(() => {
    loadPlatformAccounts();
  }, []);

  useEffect(() => {
    const { startDate, endDate } = getDateRange(timeframeId);

    setFromDate(startDate?.toJSDate());
    setToDate(endDate?.toJSDate());
  }, [timeframeId]);

  useEffect(() => {
    if (!insights && selectedPlatformItem) {
      const { startDate, endDate } = getDateRange(timeframeId);
      const params = {
        fromDate: startDate?.toFormat("yyyy-MM-dd"),
        toDate: endDate?.toFormat("yyyy-MM-dd"),
      };
      console.log("loading insights");

      if (!selectedPlatformItem.value) {
        params.allAccounts = "true";
      } else {
        params.platformAccountId = selectedPlatformItem.value;
      }
      loadInsights(params);
    }
  }, [selectedPlatformItem, insights]);

  const netTradePnL = insights?.dailyPnL?.map(({ date, pnl, fees }) => ({
    x: date,
    y: showFees ? Math.round(100 * (pnl - fees)) / 100 : pnl,
  }));
  const cumulativePnL = insights?.cumulativePnL?.map(({ date, pnl, fees }) => ({
    x: date,
    y: showFees ? Math.round(100 * (pnl - fees)) / 100 : pnl,
  }));

  const winRate = showFees
    ? insights?.winRateAfterFees
      ? 100 * insights.winRateAfterFees
      : null
    : insights?.winRate
    ? 100 * insights.winRate
    : null;
  const lossRate = winRate ? 100 - winRate : null;

  const winLossRates = winRate
    ? [
        { x: "Loss Rate", y: lossRate, color: "tomato" },
        { x: "Win Rate", y: winRate, color: "green" },
      ]
    : [];

  const avgWinAmount = showFees
    ? insights?.averageProfitAmountAfterFees
    : insights?.averageProfitAmount;
  const avgLossAmount = showFees
    ? insights?.averageLossAmountAfterFees
    : insights?.averageLossAmount;

  const winLossRatio =
    avgWinAmount && avgLossAmount
      ? Math.abs(avgWinAmount / avgLossAmount).toFixed(1)
      : null;

  const winLossRatios = winLossRatio
    ? [
        { x: "Loss Ratio", y: 1 / (1 + winLossRatio), color: "tomato" },
        {
          x: "Win Ratio",
          y: winLossRatio / (1 + winLossRatio),
          color: "green",
        },
      ]
    : [];

  const tradeQualityHigh = insights?.highQualityTrades
    ? insights.highQualityTrades.map(({ date, trades }) => ({
        x: date,
        y: trades.length,
      }))
    : [];

  const tradeQualityLow = insights?.lowQualityTrades
    ? insights.lowQualityTrades.map(({ date, trades }) => ({
        x: date,
        y: trades.length,
      }))
    : [];
  const tradeRevenge = insights?.revengeTrades
    ? insights.revengeTrades.map(({ date, trades }) => ({
        x: date,
        y: trades.length,
      }))
    : [];
  const tradeProfit = insights?.profitTrades
    ? insights.profitTrades.map(({ date, trades }) => ({
        x: date,
        y: trades.length,
      }))
    : [];
  const tradeLoss = insights?.lossTrades
    ? insights.lossTrades.map(({ date, trades }) => ({
        x: date,
        y: trades.length,
      }))
    : [];

  const topWinningSymbols = insights?.topWinningSecuritySymbols
    ? insights.topWinningSecuritySymbols
        .map(({ securityName, pnl }) => ({ x: securityName, y: pnl }))
        .slice(0, MAX_FINSTRUMENTS)
    : [];
  const topLosingSymbols = insights?.topLosingSecuritySymbols
    ? insights.topLosingSecuritySymbols
        .map(({ securityName, pnl }) => ({ x: securityName, y: Math.abs(pnl) }))
        .slice(0, MAX_FINSTRUMENTS)
    : [];

  const topWinningStrategies = insights?.topWinningStrategies
    ? insights.topWinningStrategies
        .map(({ setup, pnl }) => ({ x: setup, y: pnl }))
        .slice(0, MAX_STRATEGIES)
    : [];
  const topLosingStrategies = insights?.topLosingStrategies
    ? insights.topLosingStrategies
        .map(({ setup, pnl }) => ({ x: setup, y: Math.abs(pnl) }))
        .slice(0, MAX_STRATEGIES)
    : [];

  const topWinningTrades = insights?.topWinningTrades
    ? insights.topWinningTrades
        .map((trade) => ({
          ...trade,
          tradeOpenedAt: formatJournalDate(trade.tradeOpenedAt),
          tradeClosedAt: formatJournalDate(trade.tradeClosedAt),
          pnl: formatPnl(trade.pnl),
        }))
        .slice(0, MAX_TRADES)
    : [];
  const topLosingTrades = insights?.topLosingTrades
    ? insights.topLosingTrades
        .map((trade) => ({
          ...trade,
          tradeOpenedAt: formatJournalDate(trade.tradeOpenedAt),
          tradeClosedAt: formatJournalDate(trade.tradeClosedAt),
          pnl: formatPnl(trade.pnl),
        }))
        .slice(0, MAX_TRADES)
    : [];

  const milestonesSnapshot = insights?.milestonesSnapshot
    ? insights.milestonesSnapshot.map(
        ({ milestone: { milestoneText, reachedOn } }) => ({
          milestone: milestoneText,
          reachedOn: formatJournalDate(reachedOn),
        })
      )
    : [];
  const improvementAreasSnapshot = insights?.improvementAreasSnapshot
    ? insights.improvementAreasSnapshot.map(
        ({ improvementArea: { action, startDate, endDate } }) => ({
          action,
          status: calcImprovementAreaStatus(startDate, endDate),
        })
      )
    : [];

  return (
    <div>
      <Layout>
        <div className="h-full">
          <div className="py-4 h-full flex">
            <div className="ml-5 w-11/12 h-full flex flex-col border-x border-y border-gray-300 bg-white pb-4 px-5 mx-auto overflow-auto">
              <div className="w-full h-full">
                <div className=" bg-white z-50">
                  {/* sticky top-0 */}
                  <div className="text-center">
                    <div className="pt-2 text-center relative">
                      <h2 className="mb-0 text-2xl self-center">
                        Portfolio Insights
                      </h2>
                    </div>
                    <hr className="w-full border-t border-gray-300 mx-auto" />
                  </div>
                  <div className="w-full">
                    {platformAccountItems ? (
                      <Select
                        styles={{
                          control: (base) => ({
                            ...base,
                            height: 35,
                            minHeight: 35,
                            width: "fit-content",
                          }),
                          input: (base) => ({
                            ...base,
                            margin: "0px",
                          }),
                        }}
                        options={platformAccountItems}
                        value={selectedPlatformItem}
                        onChange={handleAccountChange}
                        placeholder="Select investing account..."
                      />
                    ) : (
                      "Loading accounts..."
                    )}
                  </div>
                  <div className="flex">
                    <div className="basis-full">
                      <div className="mt-4">
                        <label className="text-base mb-1">Timeline</label>
                        <div className="flex flex-wrap">
                          <Pill
                            size="lg"
                            className="mr-2 mb-2"
                            key={6}
                            id={6}
                            controlled
                            onClick={handlePillClick}
                            isActive={timeframeId === 6}
                          >
                            Now
                          </Pill>
                          <Pill
                            size="lg"
                            className="mr-2 mb-2"
                            key={1}
                            id={1}
                            controlled
                            onClick={handlePillClick}
                            isActive={timeframeId === 1}
                          >
                            A Week Ago
                          </Pill>
                          <Pill
                            size="lg"
                            className="mr-2 mb-2"
                            key={2}
                            id={2}
                            controlled
                            onClick={handlePillClick}
                            isActive={timeframeId === 2}
                          >
                            A Month Ago
                          </Pill>
                          <Pill
                            size="lg"
                            className="mr-2 mb-2"
                            key={3}
                            id={3}
                            controlled
                            onClick={handlePillClick}
                            isActive={timeframeId === 3}
                          >
                            3 Months Ago
                          </Pill>
                          <Pill
                            size="lg"
                            className="mr-2 mb-2"
                            key={4}
                            id={4}
                            controlled
                            onClick={handlePillClick}
                            isActive={timeframeId === 4}
                          >
                            6 Months Ago
                          </Pill>
                          <Pill
                            size="lg"
                            className="mr-2 mb-2"
                            key={5}
                            id={5}
                            controlled
                            onClick={handlePillClick}
                            isActive={timeframeId === 5}
                          >
                            A Year Ago
                          </Pill>
                        </div>
                        <div className="mt-4">
                          <label className="text-base">Custom Dates</label>
                          <div className="flex items-center">
                            <DatePicker
                              className="border rounded-md text-sm p-2"
                              selected={fromDate}
                              onChange={(date) => setFromDate(date)}
                            />
                            <span className="inline-block mx-2">To</span>
                            <DatePicker
                              className="border rounded-md text-sm p-2"
                              selected={toDate}
                              onChange={(date) => setToDate(date)}
                            />
                            <button
                              className="ml-5 rounded-full bg-purple-800 text-white px-4 py-1"
                              onClick={handleCustomDatesClick}
                            >
                              Apply
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="ml-4 basis-1/2">
                      <div className="border p-2 rounded-md w-full h-full">
                        <div className="w-full h-full flex">
                          <div className="h-28 w-32 rounded-full overflow-hidden mr-4">
                            <img src="/images/portfolio-example.jpg" />
                          </div>
                          <div>
                            <h3 className="text-xl">Portfolio Dream</h3>
                            <p>Music Tour</p>

                            <h3 className="text-xl">Personal Why</h3>
                            <p>
                              To share my voice with 10s of 1000s of people!
                            </p>

                            <div>
                              <h3 className="text-xl">Progress</h3>
                              <div class="w-full h-6 mb-4 bg-gray-200 rounded-full dark:bg-gray-700">
                                <div
                                  class="h-6 bg-purple-600 rounded-full dark:bg-purple-500 text-white pl-2"
                                  style={{ width: "45%" }}
                                ></div>
                              </div>

                              <button
                                className="rounded-full bg-purple-800 text-white px-4 py-1 w-full"
                                onClick={() => {
                                  scrollToRecommendations();
                                  setShowRecommendationsModal(true);
                                }}
                              >
                                Get Recommendations
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <hr className="w-full border-t border-gray-300 mx-auto" />
                </div>
                {!loading ? (
                  <div className="mx-auto mt-4 w-full">
                    <div className="w-full">
                      <div className="health">
                        <h3 className="text-2xl">Your Portfolio Health</h3>
                        <h4 className="text-green-400">Good</h4>
                        <h5>Your portfolio is up 3% this week!</h5>

                        <div className="flex items-center">
                          <PieChart2
                            data={holdingsData}
                            title="Jabari's Portfolio"
                          />
                          <div className="flex">
                            <div className="mr-4">
                              <h6>Total Invested</h6>
                              <p className="text-sm">$24,000</p>
                            </div>
                            <div className="mr-4">
                              <h6>Total Value</h6>
                              <p className="text-sm">$30,000</p>
                            </div>
                            <div className="mr-4">
                              <h6>Total ROI</h6>
                              <p className="text-sm">20%</p>
                            </div>
                            <div className="mr-4">
                              <h6>Total Earnings</h6>
                              <p className="text-sm">$6,000</p>
                            </div>
                            <div className="mr-4">
                              <h6>Yearly Earnings</h6>
                              <p className="text-sm">$3,000</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <hr className="w-full border-t border-gray-300 mx-auto" />
                      <div className="holdings">
                        <h3 className="text-2xl">Your Portfolio Holdings</h3>
                        <div className="flex">
                          <span className="text-base">Winners</span>
                          <Switch
                            sx={{
                              "span.chakra-switch__track:not([data-checked])": {
                                backgroundColor: "purple.500",
                              },
                            }}
                            colorScheme="purple"
                            className="mx-2"
                            // onChange={(e) => setIsAdvancedExit(e.target.checked)}
                          />
                          <span className="text-base">Losers</span>
                        </div>
                        <div className="flex justify-between">
                          <div>
                            <PieChart2
                              data={holdingsData}
                              title="% of Portfolio Holdings"
                            />
                            <p>
                              80% of your holdings are in Amazon and S&P 500
                            </p>
                          </div>
                          <div>
                            <PieChart2
                              data={roiData}
                              title="% of Portfolio ROI"
                            />
                            <p className="text-green-600">
                              80% of your ROI comes from Tesla and Amazon
                            </p>
                          </div>
                          <div>
                            <PieChart2
                              data={earningsData}
                              title="% of Portfolio Earnings"
                            />
                            <p className="text-green-600">
                              80% of your Earnings come from S&P 500 and Tesla
                            </p>
                          </div>
                        </div>
                      </div>
                      <hr className="w-full border-t border-gray-300 mx-auto" />
                      <div className="benchmarks">
                        <h3 className="text-2xl">Portfolio Benchmarks</h3>
                        <div className="mt-4">
                          <BarChart2 />
                        </div>
                      </div>
                      <hr className="w-full border-t border-gray-300 mx-auto" />
                      <div
                        ref={recommendationsRef}
                        className="recommendations pb-4"
                      >
                        <h3 className="text-2xl">
                          Your Portfolio Recommendations
                        </h3>

                        <div>
                          <div className="mb-2">
                            <h6>Yearly Earnings Goal</h6>
                            <input
                              type="number"
                              className="border border-gray-300 px-2"
                            />
                          </div>
                          {/* 
                          <div className="mb-2">
                            <h6>Per</h6>
                            <div className="flex">
                              <span className="text-base">Month</span>
                              <Switch
                                sx={{
                                  "span.chakra-switch__track:not([data-checked])":
                                    {
                                      backgroundColor: "purple.500",
                                    },
                                }}
                                colorScheme="purple"
                                className="mx-2"
                                // onChange={(e) => setIsAdvancedExit(e.target.checked)}
                              />
                              <span className="text-base">Year</span>
                            </div>
                          </div> */}
                          <div className="mb-4">
                            <label>Appetite</label>
                            <Select
                              styles={{
                                control: (base) => ({
                                  ...base,
                                  height: 35,
                                  minHeight: 35,
                                  width: "fit-content",
                                }),
                                input: (base) => ({
                                  ...base,
                                  margin: "0px",
                                }),
                              }}
                              options={appetites}
                              // value={selectedPlatformItem}
                              // onChange={handleAccountChange}
                              placeholder="Choose your appetite..."
                            />
                          </div>

                          <div className="mb-4">
                            <label>Risk Tolerance</label>
                            <Select
                              styles={{
                                control: (base) => ({
                                  ...base,
                                  height: 35,
                                  minHeight: 35,
                                  width: "fit-content",
                                }),
                                input: (base) => ({
                                  ...base,
                                  margin: "0px",
                                }),
                              }}
                              options={riskTolerances}
                              // value={selectedPlatformItem}
                              // onChange={handleAccountChange}
                              placeholder="Choose your risk tolerance..."
                            />
                          </div>

                          <div>
                            <button
                              className="rounded-full bg-purple-800 text-white px-4 py-1 w-fit"
                              onClick={() => {
                                setShowRecommendationsModal(true);
                              }}
                            >
                              Get Recommendations
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <Loader />
                )}
              </div>
            </div>
          </div>
        </div>
        <PortfolioRecommendationsModal
          isOpen={showRecommendationsModal}
          onClose={() => setShowRecommendationsModal(false)}
          onSubmit={() => setShowRecommendationsModal(false)}
        >
          {recommendationsData.map(({ name, recommendation, color }) => (
            <div className="flex">
              <div
                className={`h-8 w-8 bg-[${color}] mb-2`}
                style={{ backgroundColor: color }}
              />
              <span className="ml-2">{name}</span>
              <span
                className="mx-2 font-semibold"
                style={{ color: recommendation.color }}
              >
                {recommendation.text}
              </span>
              <Tooltip info={<div><h5>Key Recommendation Factors</h5>  <ol>{recommendation.factors.map((factor) => (<li>{factor}</li>))}</ol></div>}  />
            </div>
          ))}
          <div className="rebalance">
            <h4 className="text-lg mt-4">Rebalance Your Portfolio</h4>
            <p className="text-green-600">
              80% of your ROI comes from Tesla and Amazon
            </p>
            <p className="text-green-600">
              80% of your Earnings come from S&P 500 and Tesla
            </p>
            <p>You could increase your earnings 50% from investing more in Tesla</p>
          </div>
        </PortfolioRecommendationsModal>
      </Layout>
    </div>
  );
}
