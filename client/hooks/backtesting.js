import useData from "./data";

const BACKTESTING_REPORTS_ENDPOINT_EXAMPLE = "backtestingReports";
const BACKTESTING_REPORTS_ENDPOINT =
  "strategies/{strategyId}/backtestingReports/{reportId}";
const PORT = 8081;

export default function useBacktesting() {
  const { fetchUserData } = useData(PORT); // TODO: fix this so it leverages the correct TradingStragies acct id

  function fetchBacktestingReportExample(reportId = 1) {
    return fetchUserData(`${BACKTESTING_REPORTS_ENDPOINT_EXAMPLE}/${reportId}`);
  }

  function fetchBacktestingReport(strategyId, reportId) {
    const url = BACKTESTING_REPORTS_ENDPOINT.replace(
      "{strategyId}",
      strategyId
    ).replace("{reportId}", reportId);
    return fetchUserData(url);
  }

  return {
    fetchBacktestingReport,
    fetchBacktestingReportExample,
  };
}
