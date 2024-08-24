import React, { useState, useEffect } from "react";
import Select from "react-select";
import { Checkbox } from "@chakra-ui/react";
import Layout from "../../../../components/appV2/layout";
import BasicTable from "../../../../components/appV2/basic-table";

const columns = [
    {
        Header: "Id",
        accessor: "id",
      },
    {
        Header: "Date",
        accessor: "transactionAt",
        sticky: "left"
    },

    {
      Header: "Symbol",
      accessor: "securityName",
      sticky: "left",
    },
    {
      Header: "Action",
      accessor: "investAction",
      sticky: "left",
    },
    {
        Header: "Qty",
        accessor: "quantity",
        sticky: "left",
    },
    {
      Header: "Price",
      accessor: "price",
    },
    {
      Header: "Fees",
      accessor: "fees",
    },
    {
      Header: "Amount",
      accessor: "amount",
    },
    {
      Header: "PnL",
      accessor: "pnl",
    },
    {
        Header: "Why Buy Or Sell?",
        accessor: "whyBuyOrSell",
    },
    {
        Header: "Investing Strategy",
        accessor: "investStrategy",
    },
  ];

  const testData = [
    {
        id: 1,
        securityName: "TSLA",
        investAction: "Buy",
        quantity: 10,
        transactionAt: "2024-06-12T10:45:16.000Z",
        price: 177.29,
        fees: 0.00,
        amount: 1772.90,
        pnl: 0,
        whyBuyOrSell: "",
        investStrategy: "",
    },
    {
        id: 2,
        securityName: "TSLA",
        investAction: "Sell",
        quantity: 2,
        transactionAt: "2024-08-12T10:45:16.000Z",
        price: 197.49,
        fees: 0.00,
        amount: 394.98,
        pnl: 40,
        whyBuyOrSell: "",
        investStrategy: "",
    }
  ];

export default function InvestingPortfolio() {
 

  return (
    <div>
      <Layout>
        <div className="h-full">
          <div className="py-4 h-full flex">
            <div className="ml-5 w-11/12 h-full flex flex-col border-x border-y border-gray-300 bg-white pb-4 mx-auto overflow-auto">
              <div className="w-full h-full">
                <div className=" w-[90%] mx-auto h-98 mt-2 flex flex-col items-center">
                  <div className="flex w-full justify-center">
                  <div className="mr-2">
                      <img src="/images/stocks/TSLA.png" />
                    </div>
                  <h4 className="ml-8 mt-3">
                    My Tesla Motors Transactions
                  </h4>
                    </div>

                    <div>
                        <div className="mt-6 max-w-[90%] mx-auto">
                    <BasicTable
                      className="h-[50vh] border-b"
                      columns={columns}
                      data={testData}
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
