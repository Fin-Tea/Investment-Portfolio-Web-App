import React from "react";
import Popup from "reactjs-popup";
import "reactjs-popup/dist/index.css";
import Creatable from "react-select/creatable";
import InteractiveTable from "./interactive-table";
import { formatDatetime } from "../date-utils";
import PropTypes from "prop-types";
import TradePlanLink from "./trade-plan-link";

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
  },
];

export default function TradeHistory({
  trades,
  catalysts,
  setups,
  onCreateCatalyst,
  onCreateSetup,
  onSave,
  saveError,
  tradePlans,
  onTradePlanLinkToggle,
  onUpload,
}) {
  // TODO: React.useMemo this
  const columns = [
    {
      Header: "ID",
      accessor: "id",
    },
    {
      Header: "Trade Started",
      accessor: "tradeOpenedAt",
    },
    {
      Header: "Trade Ended",
      accessor: "tradeClosedAt",
    },
    {
      Header: "Qty",
      accessor: "quantity",
    },
    {
      Header: "Security",
      accessor: "securityName",
    },
    {
      Header: "Security Symbol",
      accessor: "securitySymbol",
    },
    {
      Header: "Underlying Symbol",
      accessor: "underlyingSymbol",
    },

    {
      Header: "Profit/Loss",
      accessor: "profitLoss",
    },
    {
      Header: "Catalyst",
      accessor: "catalystId",
      Cell: ({ cell, register, setValue }) => {
        const { id: tradeId, catalystId } = cell.row.values;
        const defaultValue = catalysts.find(
          ({ value }) => value === catalystId
        );
        const name = `rows.${cell.row.index}.catalystId`;

        return (
          <Creatable
            options={catalysts}
            onCreateOption={onCreateCatalyst}
            defaultValue={defaultValue}
            {...register(name)}
            onChange={({ value }) => {
              setValue(name, value, { shouldDirty: true });
            }}
            styles={{
              menu: (provided, state) => ({
                ...provided,
                minWidth: 200,
                padding: 20,
              }),
            }}
          />
        );
      },
    },
    {
      Header: "Setup",
      accessor: "setupId",
      Cell: ({ cell, register, setValue }) => {
        const { setupId } = cell.row.values;
        const defaultValue = setups.find(({ value }) => value === setupId);
        const name = `rows.${cell.row.index}.setupId`;
        return (
          <Creatable
            options={setups}
            onCreateOption={onCreateSetup}
            defaultValue={defaultValue}
            {...register(name)}
            onChange={({ value }) => {
              setValue(name, value, { shouldDirty: true });
            }}
            styles={{
              menu: (provided, state) => ({
                ...provided,
                minWidth: 200,
                padding: 20,
              }),
            }}
          />
        );
      },
    },
    {
      Header: "What Happened",
      accessor: "notes",
      Cell: ({ cell, register }) => {
        const { notes } = cell.row.values;
        const name = `rows.${cell.row.index}.notes`;
        return (
          <textarea
            name={name}
            style={{ width: "100%" }}
            defaultValue={notes}
            {...register(name)}
          />
        );
      },
    },
    {
      Header: "Trade Plan",
      accessor: "tradePlanId",
      Cell: ({ cell }) => {
        const { id, underlyingSymbol, securitySymbol, tradePlanId } =
          cell.row.values;

        return (
          <TradePlanLink
            tradeId={id}
            tradeSymbol={underlyingSymbol || securitySymbol}
            catalysts={catalysts}
            tradePlanId={tradePlanId}
            tradePlans={tradePlans}
            onToggleLink={onTradePlanLinkToggle}
          />
        );
      },
    },
  ];

  const data = testData.map((trade) => {
    const {
      id,
      tradeOpenedAt,
      tradeClosedAt,
      tradeDirectionType,
      securityType,
      quantity,
      openPrice,
      closePrice,
      securityName,
      securitySymbol,
      underlyingSymbol,
      catalystId,
      setupId,
      risk,
      reward,
      notes,
      tradePlanId,
    } = trade;
    let profitLoss =
      tradeDirectionType === "Long"
        ? parseFloat(closePrice) - parseFloat(openPrice) // need to update for short-selling and futures
        : parseFloat(openPrice) - parseFloat(closePrice);

    profitLoss *= quantity;

    if (securityType === "Option" || securityType === "Future") {
      // FIX: the $1 delta depends on the specific future. will need a map
      profitLoss *= 100;
    }
    profitLoss = profitLoss.toFixed(2);
    // TODO: map trades to include cataysts and setups
    return {
      id,
      tradeOpenedAt: formatDatetime(tradeOpenedAt),
      tradeClosedAt: formatDatetime(tradeClosedAt),
      quantity,
      profitLoss,
      securityName,
      securitySymbol,
      underlyingSymbol,
      catalystId,
      setupId,
      risk,
      reward,
      notes,
      tradePlanId,
    };
  });

  console.log("trade history data", data);

  return (
    <InteractiveTable
      title="Trade History"
      columns={columns}
      hiddenColumns={["securitySymbol", "underlyingSymbol"]}
      data={data}
      onSave={onSave}
      saveError={saveError}
      onUpload={onUpload}
    />
  );
}

TradeHistory.propTypes = {
  trades: PropTypes.arrayOf({}),
  catalysts: PropTypes.arrayOf({}),
  setups: PropTypes.arrayOf({}),
  tradePlans: PropTypes.arrayOf({}),
  onCreateCatalyst: PropTypes.func,
  onCreateSetup: PropTypes.func,
  onSave: PropTypes.func,
  saveError: PropTypes.string,
  onTradePlanLinkToggle: PropTypes.func,
  onUpload: PropTypes.func,
};

TradeHistory.defaultProps = {
  trades: testData,
  catalysts: [],
  setups: [],
  tradePlans: [],
  onCreateCatalyst: () => {},
  onCreateSetup: () => {},
  onSave: () => {},
  saveError: "",
  onTradePlanLinkToggle: () => {},
  onUpload: undefined,
};
