import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Checkbox,
} from "@chakra-ui/react";
import MiniTable from "./mini-table";
import BasicTable from "./basic-table";
import SearchBox from "./search-box";
import Tooltip from "./tooltip";
import { formatJournalDate } from "../../date-utils";

const simpleColumns = [
  {
    Header: "Symbol",
    accessor: "securitySymbol",
  },
  {
    Header: "Direction",
    accessor: "tradeDirectionType",
  },
  {
    Header: "Entry Price",
    accessor: "entry",
  },
  {
    Header: "Exit Price",
    accessor: "exit",
  },
  {
    Header: "Stop Loss",
    accessor: "stopLoss",
  },
  {
    Header: "Created On",
    accessor: "createdAt",
  },
];

const advancedColumns = [
  {
    Header: "Symbol",
    accessor: "securitySymbol",
  },
  {
    Header: "Direction",
    accessor: "tradeDirectionType",
  },
  {
    Header: "Entry Price",
    accessor: "entry",
  },
  {
    Header: "Price Target 1",
    accessor: "priceTarget1",
  },
  {
    Header: "Price Target 2",
    accessor: "priceTarget2",
  },
  {
    Header: "Price Target 3",
    accessor: "priceTarget3",
  },
  {
    Header: "Stop Loss",
    accessor: "stopLoss",
  },
  {
    Header: "Created On",
    accessor: "createdAt",
  },
];

// have a searchable list of trades (search based on symbol)
// place checkboxes next to each trade that people can check/uncheck
// then the modal has Save and Cancel buttons
export default function LinkTradesModal({
  isOpen,
  onClose,
  tradePlanInfo,
  trades,
  tradePlanItems,
  onSubmit,
}) {
  const { platformAccounts } = tradePlanItems;
  console.log("tradePlanInfo", tradePlanInfo);
  const [selectedTradeIds, setSelectedTradeIds] = useState(new Set((tradePlanInfo?.tradeResults || []).map(({ id }) => id)));
  const [searchString, setSearchString] = useState("");
  const [debouncedSearchString, setDebouncedSearchString] = useState("");

  function addTradeId(id) {
    setSelectedTradeIds(new Set([...selectedTradeIds, id]));
  }

  function removeTradeId(id) {
    selectedTradeIds.delete(id);
    setSelectedTradeIds(new Set([...selectedTradeIds]));
  }

  function resetModal() {
    setSelectedTradeIds(new Set((tradePlanInfo?.tradeResults || []).map(({ id }) => id)));
    setSearchString("");
  }


  function handleClose() {
    onClose && onClose();
    resetModal();
  }

  function handleSubmit() {
    onSubmit && onSubmit([...selectedTradeIds]);
    onClose && onClose();
    resetModal();
  }

  const tradeColumns = [
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
      Header: "Open Price",
      accessor: "openPrice",
    },
    {
      Header: "Close Price",
      accessor: "closePrice",
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
      Header: "Trading Account",
      accessor: "platformAccount",
    },
    {
      Header: "Linked",
      accessor: "tradePlan",
      sticky: "right",
      Cell: ({ cell }) => {
        const {id, tradePlan } = cell.row.values;

        return <Checkbox isChecked={selectedTradeIds.has(id)} colorScheme="purple" className="p-2" onChange={(e) => e.target.checked ? addTradeId(id) : removeTradeId(id) } />;
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
      pnl:
        trade.pnl ||
        (parseFloat(trade.closePrice) - parseFloat(trade.openPrice)).toFixed(2),
      platformAccount: platformAccount
        ? `${platformAccount.platform.name} ${platformAccount.accountName}`
        : "",
    };
  });

  if (debouncedSearchString) {
    data = data.filter(({ securityName }) =>
      securityName.toLowerCase().startsWith(debouncedSearchString.toLowerCase())
    );
  }

  useEffect(() => {
    const delayInputTimeoutId = setTimeout(() => {
      setDebouncedSearchString(searchString);
    }, 500);
    return () => clearTimeout(delayInputTimeoutId);
  }, [searchString, 500]);

  return (
    <Modal className="w-full" isOpen={isOpen} onClose={handleClose}>
      <ModalOverlay />
      <ModalContent maxWidth={800}>
        <ModalHeader>Link/Unlink Trades & Investments</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {/* symbol, direction, opened on, closed on, quantity. mini table this for consistency */}
          <MiniTable
            // className="px-2"
            title={"Trade Plan Info"}
            columns={
              tradePlanInfo.planType === "Simple"
                ? simpleColumns
                : advancedColumns
            }
            data={[tradePlanInfo]}
          />

          <div>
            <div className="flex items-center mt-4 mb-2">
              <p className="my-0">Trade/Investment Search</p>
              <Tooltip text="Check trades to link them. Uncheck trades too unlink them" />
            </div>
            <SearchBox
                      className="my-2"
                      placeholder={"Search Symbol"}
                      onSearch={setSearchString}
                    />
            <BasicTable columns={tradeColumns} data={data} rowsPerPage={5} />
          </div>
        </ModalBody>

        <ModalFooter>
          <button className="rounded-md border p-2 px-4 mr-4" onClick={handleClose}>
            {" "}
            Close
          </button>
          <button
            className="rounded-md bg-purple-800
             text-white p-2 px-4"
             onClick={handleSubmit}
          >
            Save
          </button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
