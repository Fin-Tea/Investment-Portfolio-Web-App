import Header from "../header";
import formatDate from "../../date-utils";
import styles from "./insights.module.css";
import PropTypes from "prop-types";

const testData = {
  totalProfitLoss: "-3623.00",
  totalTrades: 126,
  winRate: "0.62",
  averageWinAmount: "118.19",
  averageLossAmount: "-267.54",
  biggestWinningTradesByValue: [
    {
      id: 85,
      spread: "0.32",
      profitOrLoss: "800.00",
      timeRangeType: "Day",
      securityType: "Option",
      tradeDirectionType: "Long",
      quantity: 25,
      securitySymbol: "SPY_110321C460",
      securityName: "SPY Nov 03 2021 460.0 Call",
      openPrice: "2.05",
      closePrice: "2.37",
      risk: null,
      reward: null,
      catalystId: null,
      setupId: null,
      tradeOpenedAt: "2021-11-02T18:44:14.000Z",
      tradeClosedAt: "2021-11-02T18:59:08.000Z",
      isScaledIn: 0,
      isScaledOut: 0,
    },
    {
      id: 31,
      spread: "0.75",
      profitOrLoss: "750.00",
      timeRangeType: "Day",
      securityType: "Option",
      tradeDirectionType: "Long",
      quantity: 10,
      securitySymbol: "SPY_112621C459",
      securityName: "SPY Nov 26 2021 459.0 Call",
      openPrice: "1.01",
      closePrice: "1.76",
      risk: null,
      reward: null,
      catalystId: null,
      setupId: null,
      tradeOpenedAt: "2021-11-26T23:19:18.000Z",
      tradeClosedAt: "2021-11-26T23:27:35.000Z",
      isScaledIn: 0,
      isScaledOut: 0,
    },
    {
      id: 84,
      spread: "0.28",
      profitOrLoss: "700.00",
      timeRangeType: "Day",
      securityType: "Option",
      tradeDirectionType: "Long",
      quantity: 25,
      securitySymbol: "SPY_110321C461",
      securityName: "SPY Nov 03 2021 461.0 Call",
      openPrice: "1.74",
      closePrice: "2.02",
      risk: null,
      reward: null,
      catalystId: null,
      setupId: null,
      tradeOpenedAt: "2021-11-02T21:04:13.000Z",
      tradeClosedAt: "2021-11-02T21:38:08.000Z",
      isScaledIn: 0,
      isScaledOut: 0,
    },
  ],
  biggestLosingTradesByValue: [
    {
      id: 77,
      spread: "-0.61",
      profitOrLoss: "-3050.00",
      timeRangeType: "Day",
      securityType: "Option",
      tradeDirectionType: "Long",
      quantity: 50,
      securitySymbol: "SPY_110521C470",
      securityName: "SPY Nov 05 2021 470.0 Call",
      openPrice: "0.87",
      closePrice: "0.26",
      risk: null,
      reward: null,
      catalystId: null,
      setupId: null,
      tradeOpenedAt: "2021-11-05T18:47:31.000Z",
      tradeClosedAt: "2021-11-05T21:43:56.000Z",
      isScaledIn: 1,
      isScaledOut: 0,
    },
    {
      id: 27,
      spread: "-5.72",
      profitOrLoss: "-1144.00",
      timeRangeType: "Swing",
      securityType: "Option",
      tradeDirectionType: "Long",
      quantity: 2,
      securitySymbol: "TGT_120321C255",
      securityName: "TGT Dec 03 2021 255.0 Call",
      openPrice: "5.75",
      closePrice: "0.03",
      risk: null,
      reward: null,
      catalystId: null,
      setupId: null,
      tradeOpenedAt: "2021-11-17T20:33:06.000Z",
      tradeClosedAt: "2021-12-03T21:45:22.000Z",
      isScaledIn: 0,
      isScaledOut: 0,
    },
    {
      id: 111,
      spread: "-7.84",
      profitOrLoss: "-784.00",
      timeRangeType: "Swing",
      securityType: "Option",
      tradeDirectionType: "Long",
      quantity: 1,
      securitySymbol: "TSLA_102221C870",
      securityName: "TSLA Oct 22 2021 870.0 Call",
      openPrice: "23.41",
      closePrice: "15.57",
      risk: null,
      reward: null,
      catalystId: null,
      setupId: null,
      tradeOpenedAt: "2021-10-18T23:00:03.000Z",
      tradeClosedAt: "2021-10-20T22:59:23.000Z",
      isScaledIn: 0,
      isScaledOut: 0,
    },
  ],
  biggestWinningTradesBySpread: [
    {
      id: 11,
      spread: "6.59",
      profitOrLoss: "659.00",
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
      catalystId: null,
      setupId: null,
      tradeOpenedAt: "2021-12-17T01:09:36.000Z",
      tradeClosedAt: "2021-12-17T21:18:23.000Z",
      isScaledIn: 0,
      isScaledOut: 0,
    },
    {
      id: 110,
      spread: "1.97",
      profitOrLoss: "197.00",
      timeRangeType: "Day",
      securityType: "Option",
      tradeDirectionType: "Long",
      quantity: 1,
      securitySymbol: "TSLA_102221C870",
      securityName: "TSLA Oct 22 2021 870.0 Call",
      openPrice: "10.68",
      closePrice: "12.65",
      risk: null,
      reward: null,
      catalystId: null,
      setupId: null,
      tradeOpenedAt: "2021-10-21T18:35:39.000Z",
      tradeClosedAt: "2021-10-21T18:37:14.000Z",
      isScaledIn: 0,
      isScaledOut: 0,
    },
    {
      id: 31,
      spread: "0.75",
      profitOrLoss: "750.00",
      timeRangeType: "Day",
      securityType: "Option",
      tradeDirectionType: "Long",
      quantity: 10,
      securitySymbol: "SPY_112621C459",
      securityName: "SPY Nov 26 2021 459.0 Call",
      openPrice: "1.01",
      closePrice: "1.76",
      risk: null,
      reward: null,
      catalystId: null,
      setupId: null,
      tradeOpenedAt: "2021-11-26T23:19:18.000Z",
      tradeClosedAt: "2021-11-26T23:27:35.000Z",
      isScaledIn: 0,
      isScaledOut: 0,
    },
  ],
  biggestLosingTradesBySpread: [
    {
      id: 111,
      spread: "-7.84",
      profitOrLoss: "-784.00",
      timeRangeType: "Swing",
      securityType: "Option",
      tradeDirectionType: "Long",
      quantity: 1,
      securitySymbol: "TSLA_102221C870",
      securityName: "TSLA Oct 22 2021 870.0 Call",
      openPrice: "23.41",
      closePrice: "15.57",
      risk: null,
      reward: null,
      catalystId: null,
      setupId: null,
      tradeOpenedAt: "2021-10-18T23:00:03.000Z",
      tradeClosedAt: "2021-10-20T22:59:23.000Z",
      isScaledIn: 0,
      isScaledOut: 0,
    },
    {
      id: 27,
      spread: "-5.72",
      profitOrLoss: "-1144.00",
      timeRangeType: "Swing",
      securityType: "Option",
      tradeDirectionType: "Long",
      quantity: 2,
      securitySymbol: "TGT_120321C255",
      securityName: "TGT Dec 03 2021 255.0 Call",
      openPrice: "5.75",
      closePrice: "0.03",
      risk: null,
      reward: null,
      catalystId: null,
      setupId: null,
      tradeOpenedAt: "2021-11-17T20:33:06.000Z",
      tradeClosedAt: "2021-12-03T21:45:22.000Z",
      isScaledIn: 0,
      isScaledOut: 0,
    },
    {
      id: 12,
      spread: "-4.34",
      profitOrLoss: "-434.00",
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
      catalystId: null,
      setupId: null,
      tradeOpenedAt: "2021-12-15T00:45:16.000Z",
      tradeClosedAt: "2021-12-16T22:05:47.000Z",
      isScaledIn: 0,
      isScaledOut: 0,
    },
  ],
  mostProfitableSetup: "Not enough info",
  leastProfitableSetup: "Not enough info",
  longestWinningStreak: {
    longestTradeStreak: 8,
    start: "2021-12-28T21:12:45.000Z",
    end: "2021-12-28T21:50:38.000Z",
  },
  longestLosingStreak: {
    longestTradeStreak: 5,
    start: "2021-07-21T19:48:59.000Z",
    end: "2021-07-22T22:44:23.000Z",
  },
};

const fieldsMap = {
  totalProfitLoss: { display: "Total Earnings", prefix: "$" },
  totalTrades: { display: "Total Trades" },
  winRate: { display: "Win Rate", multiplier: 100, suffix: "%" },
  averageWinAmount: { display: "Avg. Win Amount", prefix: "$" },
  averageLossAmount: { display: "Avg. Loss Amount", prefix: "$" },
  biggestWinningTradesByValue: {
    display: "Biggest Winning Trades (by amount)",
    isTradesList: true,
  },
  biggestLosingTradesByValue: {
    display: "Biggest Losing Trades (by amount)",
    isTradesList: true,
  },
  biggestWinningTradesBySpread: {
    display: "Biggest Winning Trades (by spread)",
    isTradesList: true,
    isSpread: true,
  },
  biggestLosingTradesBySpread: {
    display: "Biggest Losing Trades (by spread)",
    isTradesList: true,
    isSpread: true,
  },
  mostProfitableSetup: { display: "Most Profitable Setup", isSetup: true },
  leastProfitableSetup: { display: "Least Profitable Setup", isSetup: true },
  longestWinningStreak: {
    display: "Longest Winning Streak",
    isTradeStreak: true,
  },
  longestLosingStreak: {
    display: "Longest Losing Streak",
    isTradeStreak: true,
  },
};

function formatTrades(trades, isSpread) {
  return trades.map((trade) => {
    const {
      profitOrLoss,
      spread,
      tradeClosedAt,
      securityName,
      tradeDirectionType,
    } = trade;

    let amount = parseFloat(isSpread ? spread : profitOrLoss).toLocaleString(
      "en-US"
    );

    if (amount.includes("-")) {
      amount = amount.replace("-", "-$");
    } else {
      amount = `$${amount}`;
    }

    return `${amount} ${isSpread ? "spread" : "earnings"} | ${formatDate(
      tradeClosedAt
    )} | ${securityName} ${tradeDirectionType}`;
  });
}

function mapDataToRowsDisplay(insightsData) {
  const rows = Object.keys(insightsData).reduce((acc, key) => {
    const fieldInfo = fieldsMap[key];
    if (fieldInfo) {
      const {
        display,
        prefix,
        suffix,
        multiplier,
        isTradesList,
        isTradeStreak,
        isSpread,
        isSetup,
      } = fieldsMap[key];
      const label = display;
      const row = { label };
      let value = insightsData[key];

      if (value) {
        if (multiplier) {
          value = parseFloat(value) * multiplier;
        }

        if (prefix) {
          value = value.toString();
          value = value.includes("-")
            ? value.replace("-", "-$")
            : `${prefix}${value}`;
        } else if (suffix) {
          value = `${value}${suffix}`;
        } else if (isTradesList) {
          value = formatTrades(value, isSpread);
        } else if (isTradeStreak) {
          value = `${value.longestTradeStreak} trades | ${formatDate(
            value.start
          )} - ${formatDate(value.end)}`;
        } else if (isSetup && value.setupId) {
          value = `${value.setupDescription} | ${value.profitOrLossCount} time${
            value.profitOrLossCount === 1 ? "" : "s"
          }`;
        }

        row.values = isTradesList ? value : [value];

        acc.push(row);
      }
    }

    return acc;
  }, []);

  return rows;
}

export default function Insights({ insightsData }) {
  const rows = mapDataToRowsDisplay(insightsData);
  return (
    <div>
      <Header>Trade Insights</Header>
      <hr className={styles.underline} />
      <div className="grid">
        {rows.map((row, i) => {
          return (
            <div key={i} className="row">
              <div className="col">
                <h6>{row.label}</h6>
              </div>
              <div className="col">
                {row.values.length ? (
                  row.values.map((val, j) => (
                    <div key={j}>
                      <p className={styles.dataValue}>{val}</p>
                    </div>
                  ))
                ) : (
                  <p className={styles.dataValue}>Not Enough Info</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

Insights.propTypes = {
  insightsData: PropTypes.shape({}),
};

Insights.defaultProps = {
  insightsData: testData,
};
