import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import CandlestickChart from "../../../../../components/candlestick-chart";
import useBacktesting from "../../../../../hooks/backtesting";
import Loader from "../../../../../components/loader";

function formatPriceData(priceData) {
  return priceData.map((priceBar) => ({
    x: new Date(priceBar.date),
    ...priceBar,
  }));
}

function formatStudyData(priceData) {
  const priceLevelMap = new Map();
  const valueMap = new Map();

  priceData.forEach((priceBar) => {
    if (priceBar.studies) {
      priceBar.studies.forEach((study) => {
        study.values.forEach((studyValue) => {
          const { type } = studyValue;
          if (type === "zone") {
            const high = studyValue.high;
            const low = studyValue.low;

            const chartDatumHigh = {
              x: new Date(priceBar.date),
              y: high,
              studyName: study.name,
              studyType: type,
              studyValueDescription: "high",
            };

            const chartDatumLow = {
              x: new Date(priceBar.date),
              y: low,
              studyName: study.name,
              studyType: type,
              studyValueDescription: "low",
            };
            if (priceLevelMap.has(high)) {
              const zoneHighValues = priceLevelMap.get(high);

              priceLevelMap.set(high, [...zoneHighValues, chartDatumHigh]);
            } else {
              priceLevelMap.set(high, [chartDatumHigh]);
            }

            if (priceLevelMap.has(low)) {
              const zoneLowValues = priceLevelMap.get(low);

              priceLevelMap.set(low, [...zoneLowValues, chartDatumLow]);
            } else {
              priceLevelMap.set(low, [chartDatumLow]);
            }
          } else if (type === "value") {
            // TODO: Implement
          }
        });
      });
    }
  });

  const priceLevels = Array.from(priceLevelMap.values());
  const values = Array.from(valueMap.values());

  return priceLevels.concat(values);
}

function combineOrders(periodReports) {
  return periodReports.reduce((acc, report) => acc.concat(report.orders), []);
}

function formatOrderData(periodReports) {
  const orderData = combineOrders(periodReports);
  return orderData.map((order) => ({
    x: new Date(order.orderDate),
    y: order.price,
    quantity: order.quantity,
    side: order.side,
    description: order.description,
    price: order.price,
  }));
}

export default function BacktestingReport() {
  const router = useRouter();
  const { strategyId, reportId } = router.query;
  console.log(router.query);
  const [backtestingReportData, setBacktestingReportData] = useState(null);
  const { fetchBacktestingReport } = useBacktesting();
  // fetch backtesting report data

  async function loadData() {
    const backtestingReportResp = await fetchBacktestingReport(
      strategyId,
      reportId
    );
    console.log("backtestingReportResp", backtestingReportResp);
    if (backtestingReportResp?.data) {
      setBacktestingReportData(backtestingReportResp.data);
    }
  }

  useEffect(() => {
    if (strategyId && reportId && !backtestingReportData) {
      loadData();
    }
  }, [strategyId, reportId, backtestingReportData]);

  useEffect(() => {
    if (backtestingReportData) {
      console.log("backtestingReportData", backtestingReportData);
    }
  }, [backtestingReportData]);

  return (
    <div>
      <p>Backtesting Report</p>
      {backtestingReportData ? (
        <div>
          <div style={{ height: 700, width: 1000 }}>
            <CandlestickChart
              priceData={formatPriceData(
                backtestingReportData.priceData || []
              ).slice(0)}
              studyData={formatStudyData(backtestingReportData.priceData || [])}
              orderData={formatOrderData(
                backtestingReportData.backtestingReport.report?.periodReports ||
                  []
              )}
            />
          </div>
          <div style={{ marginLeft: 20 }}>
            <h2>Insights</h2>
            <p>{`Security Symbol: ${
              backtestingReportData.backtestingReport?.report?.securitySymbol ||
              "NA"
            }`}</p>
            <p>{`Report start date: ${
              backtestingReportData.backtestingReport?.report?.startDate || "NA"
            }`}</p>
            <p>{`Report end date: ${
              backtestingReportData.backtestingReport?.report?.endDate || "NA"
            }`}</p>
            <p>{`Total Profit/Loss Spread: $${
              backtestingReportData.backtestingReport?.report
                ?.totalProfitLoss || "NA"
            }`}</p>
            <p>{`Total Trades: ${
              backtestingReportData.backtestingReport?.report?.totalTrades ||
              "NA"
            }`}</p>
            <p>{`Total Wins: ${
              backtestingReportData.backtestingReport?.report?.totalWins || "NA"
            }`}</p>
            <p>{`Win rate: ${
              backtestingReportData.backtestingReport?.report?.winRate || "NA"
            }`}</p>
            <p>{`Average Win Amount Spread: $${
              backtestingReportData.backtestingReport?.report?.avgWinAmount ||
              "NA"
            }`}</p>
            <p>{`Average Loss Amount Spread: $${
              backtestingReportData.backtestingReport?.report?.avgLossAmount ||
              "NA"
            }`}</p>
            <p>{`Max Profit Period: ${
              backtestingReportData.backtestingReport?.report
                ?.maxProfitLossPeriodDescription || "NA"
            }`}</p>
            <p>{`Max Profit Amount Spread: ${
              backtestingReportData.backtestingReport?.report?.maxProfitLoss ||
              "NA"
            }`}</p>
            <p>{`Min Profit Period: ${
              backtestingReportData.backtestingReport?.report
                ?.minProfitLossPeriodDescription || "NA"
            }`}</p>
            <p>{`Min Profit Amount Spread: ${
              backtestingReportData.backtestingReport?.report?.minProfitLoss ||
              "NA"
            }`}</p>
          </div>
        </div>
      ) : (
        <Loader />
      )}
    </div>
  );
}
