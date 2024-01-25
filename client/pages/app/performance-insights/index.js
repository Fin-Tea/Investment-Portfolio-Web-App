import React, { useState } from "react";
import Select from "react-select";
import Layout from "../../../components/app/layout";
import MiniTable from "../../../components/app/mini-table";
import LineChart from "../../../components/line-chart";
import PieChart from "../../../components/app/pie-chart";
import Pill from "../../../components/app/pill";
import DatePicker from "react-datepicker";
import { formatJournalDate } from "../../../date-utils";

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

const topWinningStrategies = [
  // clock-wise
  { x: "Bullish Engulfing Candle", y: 1 },
  { x: "Gap Up", y: 1.5 },
  { x: "Supply & Demand Short", y: 2 },
];

const topLosingStrategies = [
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

let topLosingTrades = [
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

let topWinningTrades = [
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
  { id: 2, action: "Reduce risk amount per trade to max $3000" },
  {
    id: 3,
    action: "Increase account size to reduce risk amount per trade to 2%",
  },
  { id: 4, action: "Reduce avg. number of revenge trades" },
  { id: 5, action: "Reduce avg. number of low quality trades" },
  // { id: 6, action: "Increase avg. number of high quality trades" },
  // { id: 7, action: "Increase your win/loss ratio to 3:1" },
];

export default function PerformanceInsights() {
  const [platform, setPlatform] = useState(platformOptions[0]);
  const [timeframeId, setTimeframeId] = useState(1);
  const [dateFrom, setDateFrom] = useState(null);
  const [dateTo, setDateTo] = useState(null);

  function handlePillClick({ id }) {
    setTimeframeId(id);
  }

  topWinningTrades = topWinningTrades.map((t) => ({
    ...t,
    tradeOpenedAt: formatJournalDate(t.tradeOpenedAt),
    tradeClosedAt: formatJournalDate(t.tradeClosedAt),
    pnl: (parseFloat(t.closePrice) - parseFloat(t.openPrice)).toFixed(2),
  }));

  topLosingTrades = topLosingTrades.map((t) => ({
    ...t,
    tradeOpenedAt: formatJournalDate(t.tradeOpenedAt),
    tradeClosedAt: formatJournalDate(t.tradeClosedAt),
    pnl: (parseFloat(t.closePrice) - parseFloat(t.openPrice)).toFixed(2),
  }));

  return (
    <div>
      <Layout>
        <div className="h-full">
          <div className="py-4 h-full flex">
            <div className="ml-5 w-11/12 h-full flex flex-col border-x border-y border-gray-300 bg-white pb-4 px-5 mx-auto overflow-auto">
              <div className="text-center">
                <div className="pt-2 text-center relative">
                  <h2 className="mb-0 text-2xl self-center">
                    Performance Insights
                  </h2>
                </div>
                <hr className="w-full border-t border-gray-300 mx-auto" />
              </div>
              <div className="w-full h-full">
                <div className="flex">
                  <div className="basis-full">
                    <div>
                      <label className="text-base mb-1">
                        Trading/Investing Platform
                      </label>
                      <Select
                        options={platformOptions}
                        value={platformOptions.find(
                          (p) => p.value === platform.value
                        )}
                        onChange={(val) => setPlatform(val)}
                      />
                    </div>
                    <div className="mt-4">
                      <label className="text-base mb-1">Timeframe</label>
                      <div className="flex flex-wrap">
                        <Pill
                          size="lg"
                          className="mr-2 mb-2"
                          key={1}
                          id={1}
                          controlled
                          onClick={handlePillClick}
                          isActive={timeframeId === 1}
                        >
                          Past Day
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
                          Past Week
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
                          Past Month
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
                          Past Quarter
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
                          Past Year
                        </Pill>
                        <Pill
                          size="lg"
                          className="mr-2 mb-2"
                          key={6}
                          id={6}
                          controlled
                          onClick={handlePillClick}
                          isActive={timeframeId === 6}
                        >
                          All Time
                        </Pill>
                      </div>
                      <div className="mt-4">
                        <label className="text-base">Custom Dates</label>
                        <div className="flex items-center">
                          <DatePicker
                            className="border rounded-md text-sm p-2"
                            selected={dateFrom}
                            onChange={(date) => setDateFrom(date)}
                          />
                          <span className="inline-block mx-2">To</span>
                          <DatePicker
                            className="border rounded-md text-sm p-2"
                            selected={dateTo}
                            onChange={(date) => setDateTo(date)}
                          />
                          <button className="ml-5 rounded-full bg-purple-800 text-white px-4 py-1">
                            Apply
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="ml-4 basis-full">
                    <div className="border p-2 rounded-md w-full h-full">
                      <h2 className="text-lg">Ways You Can Improve</h2>
                      <ul className="list-disc">
                        {autogenWaysToImprove.map(({ action }) => (
                          <li>
                            <div className="flex">
                              <span>{action}</span>
                              {/* <button className="ml-2 rounded-full bg-purple-800 text-white px-2 h-5">
                                +
                              </button> */}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
                <hr className="w-full border-t border-gray-300 mx-auto" />
                <div className="mx-auto mt-4 w-full">
                  <div className="flex h-72">
                    <div className="basis-full border-r">
                      <LineChart
                        title="Trade/Investment Balance"
                        data={tradeBalanceData}
                        prefix="$"
                      />
                    </div>
                    <div className="basis-full border-l">
                      <div className="flex">
                        <div className="basis-full">
                          <PieChart
                            width={450}
                            title="Win/Loss Rate"
                            data={winLossRateData}
                          />
                          <div className="text-center text-sm">
                            <p>{`Win Rate ${
                              winLossRateData.find(({ x }) => x.includes("Win"))
                                .y
                            }%`}</p>
                            <p>{`Loss Rate ${
                              winLossRateData.find(({ x }) =>
                                x.includes("Loss")
                              ).y
                            }%`}</p>
                          </div>
                        </div>
                        <div className="basis-full">
                          <PieChart
                            width={450}
                            title="Win/Loss Amount Ratio"
                            data={winLossAmountData}
                          />
                          <div className="text-center text-sm">
                            <p>{`Win/Loss Amount Ratio ${
                              winLossAmountData.find(({ x }) =>
                                x.includes("Win")
                              ).y
                            }:${
                              winLossAmountData.find(({ x }) =>
                                x.includes("Loss")
                              ).y
                            }`}</p>
                            <p>{`Avg. Win Amount $200`}</p>
                            <p>{`Avg. Loss Amount $100`}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <hr className="w-full border-t border-gray-300 mx-auto lg:mt-14 xl:mt-24" />
                  <div className="flex">
                    <div className="flex basis-full flex-col border-r">
                      <div className="flex">
                        <div className="basis-full border-r mb-12">
                          <LineChart
                            title="High Quality Trades"
                            data={tradeQualityHighData}
                          />
                        </div>
                        <div className="basis-full">
                          <LineChart
                            title="Low Quality Trades"
                            data={tradeQualityLowData}
                          />
                        </div>
                      </div>
                      <div className="flex">
                        <div className="basis-full border-r">
                          <LineChart
                            title="Revenge Trades"
                            data={tradeRevengeData}
                          />
                        </div>
                        <div className="basis-full">
                          <LineChart
                            title="PnL Trades"
                            data={tradeProfitData}
                            dataset2={tradeLossData}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex basis-full flex-col justify-between">
                      <div className="flex">
                        <div className="basis-full border-r">
                          <PieChart
                            colorScale={"green"}
                            width={400}
                            title="Top Winning Finstruments"
                            data={topWinningFinstruments}
                          />
                        </div>
                        <div className="basis-full">
                          <PieChart
                            colorScale={"cool"}
                            width={400}
                            title="Top Winning Strategies"
                            data={topWinningStrategies}
                          />
                        </div>
                      </div>
                      <div className="flex">
                        <div className="basis-full">
                          <PieChart
                            colorScale={"red"}
                            width={400}
                            title="Top Losing Finstruments"
                            data={topLosingFinstruments}
                          />
                        </div>
                        <div className="basis-full border-l">
                          <PieChart
                            colorScale={"warm"}
                            width={400}
                            title="Top Losing Strategies"
                            data={topLosingStrategies}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <hr className="w-full border-t border-gray-300 mx-auto lg:mt-8 xl:mt-12" />
                  <div className="flex pb-4">
                    <div className="flex basis-full flex-col border-r">
                      <MiniTable
                        className="px-2"
                        title={"Milestones Snapshot"}
                        columns={milestonesColumns}
                        data={milestones}
                      />
                      <MiniTable
                        className="mt-4 px-2"
                        title={"Improvement Areas Snapshot"}
                        columns={improvementAreaColumns}
                        data={improvementAreas}
                      />
                    </div>

                    <div className="flex basis-full flex-col justify-between">
                      <MiniTable
                        className="px-2"
                        title={"Top Winning Trades"}
                        columns={tradeColumns}
                        data={topWinningTrades}
                      />
                      <MiniTable
                        className="mt-4 px-2"
                        title={"Top Losing Trades"}
                        columns={tradeColumns}
                        data={topLosingTrades}
                      />
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