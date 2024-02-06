import React, { useState, useEffect } from "react";
import Layout from "../../../components/app/layout";
import SearchBox from "../../../components/app/search-box";
import BasicTable from "../../../components/app/basic-table";
import ImportTradesModal from "../../../components/app/import-trades-modal";
import usePlatformAccounts from "../../../hooks/platformAccounts";
import { formatJournalDate } from "../../../date-utils";

const columns = [
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
    Header: "Platform",
    accessor: "platform",
  },
  {
    Header: "Trade Plan",
    accessor: "tradePlanId",
    sticky: "right",
    Cell: ({ cell }) => {
      const { id, securitySymbol, tradePlanId } = cell.row.values;

      return (
        <button className="rounded-full bg-purple-800 text-sm text-white px-2 py-1">
          {tradePlanId ? "View" : "Add"}
        </button>
      );
    },
  },
];

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
  const [isImportModalOpen, setImportModalOpen] = useState(false);
  const [platformAccounts, setPlatformAccounts] = useState([]);

  const { fetchPlatformAccounts } = usePlatformAccounts();

  const data = testData.map((trade) => ({
    ...trade,
    tradeOpenedAt: formatJournalDate(trade.tradeOpenedAt),
    tradeClosedAt: formatJournalDate(trade.tradeClosedAt),
    pnl: (parseFloat(trade.closePrice) - parseFloat(trade.openPrice)).toFixed(
      2
    ),
    tradePlanId: null,
  }));

  async function loadPlatformAccounts() {
    try {
      const resp = await fetchPlatformAccounts();
      console.log("platformAccounts resp", resp);
      setPlatformAccounts(resp.platformAccounts);
    } catch (e) {
      console.error(e); // show error/alert
    }
  }

  useEffect(() => {
    loadPlatformAccounts();
  }, []);

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
                    <span className="text-sm">
                      Last Updated
                      <br /> <i>Dec. 30, 2021 @ 7:57 PM</i>
                    </span>
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
                <div className="flex justify-end">
                  <SearchBox className="mr-8" placeholder={"Search Symbol"} />
                </div>
                <div className="mx-auto mt-4 max-w-[90%]">
                  <BasicTable
                    className="h-[50vh] border-b"
                    columns={columns}
                    data={data}
                  />
                </div>
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
      />
    </div>
  );
}
