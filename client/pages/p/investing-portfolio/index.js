import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
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


export default function InvestingPortfolio() {

  const router = useRouter();
  const { route } = router;

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
              <div className="w-[90%] mx-auto flex">
                
              <div className=" min-w-48">
              <Select
                        styles={{
                          control: (base) => ({
                            ...base,
                            height: 35,
                            minHeight: 35,
                          }),
                          input: (base) => ({
                            ...base,
                            margin: "0px",
                          }),
                        }}
                        placeholder="Select account..."
                        options={[]}
                        value={null}
                        onChange={() => {}}
                      />
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
                      <Link href={`${route}/1/transactions`}>
                    <button
                      className="rounded-full border-[1px] border-purple-800 text-purple-800 px-4 py-1 mt-2 mr-8"
                    >
                      View Transactions
                    </button>
                    </Link>
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
                    <Link href={`${route}/1/transactions`}>
                    <button
                      className="rounded-full border-[1px] border-purple-800 text-purple-800 px-4 py-1 mt-2 mr-8"
                    >
                      View Transactions
                    </button>
                    </Link>
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
                    <Link href={`${route}/1/transactions`}>
                    <button
                      className="rounded-full border-[1px] border-purple-800 text-purple-800 px-4 py-1 mt-2 mr-8"
                    >
                      View Transactions
                    </button>
                    </Link>
                    </div>
                  </div>
                </div>
              </div>


              <div className="w-full h-full mt-20">
                <div className=" w-[90%] mx-auto h-98 mt-2 border border-gray-2 flex flex-col items-center">
                  <div className="flex w-full justify-between">
                  <h4 className="ml-8 mt-3">
                    Past Positions
                  </h4>
                    </div>
                  <div className="w-[90%] my-3 h-36 border border-gray-2 flex flex-col px-2 py-3">
                    <div className="flex">
                    <div className="mr-2">
                      <img src="/images/stocks/CVX.jpeg" />
                    </div>
                    <div className="flex flex-col">
                        <h5>
                          Chevron Corp
                        </h5>
                        <p>CVX</p>
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
                        <p>$144</p>
                    </div>
                    <div className="flex flex-col mx-2">
                        <h5>
                         Market Value 
                        </h5>
                        <p>$14.4K</p>
                    </div>
                    <div className="flex flex-col mx-2">
                        <h5>
                         Gain/Loss
                        </h5>
                        <p className="text-green-600">$3K</p>
                    </div>
                    <div className="flex flex-col mx-2">
                        <h5>
                         ROI  
                        </h5>
                        <p className="text-green-600">26%</p>
                    </div>
                    <div className="flex flex-col mx-2">
                        <h5>
                         Hold Time  
                        </h5>
                        <p>3 Years</p>
                    </div>
                    <div className="flex flex-col mx-2">
                        <h5>
                         Cost Basis
                        </h5>
                        <p>$11.4K</p>
                    </div>
                    <div className="flex flex-col mx-2">
                        <h5>
                         Dividends
                        </h5>
                        <p>$1680</p>
                    </div>
                    </div>
                    </div>
                    <div>
                      <Link href={`${route}/1/transactions`}>
                    <button
                      className="rounded-full border-[1px] border-purple-800 text-purple-800 px-4 py-1 mt-2 mr-8"
                    >
                      View Transactions
                    </button>
                    </Link>
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
