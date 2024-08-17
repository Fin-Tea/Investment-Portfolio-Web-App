import React, { useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from "@chakra-ui/react";
import Select from "react-select";
import MiniTable from "./mini-table";
import TradePlanReadOnly from "./journal-forms/trade-plan-read-only";

const columns = [
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
    Header: "Trading Account",
    accessor: "platformAccount",
  },
];

export default function LinkTradePlanModal({
  isOpen,
  onClose,
  tradeInfo,
  tradePlanOptions,
  tradePlanItems,
  onSubmit,
}) {
  const [selectedTradePlan, setSelectedTradePlan] = useState(null);
  // label: "securitySymbol, tradeDirection, Entry, Exit (or priceTarget1), description (?), updatedAt", value: id

  return (
    <Modal className="w-full" isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent maxWidth={800}>
        <ModalHeader>{`${
          !tradeInfo?.tradePlan ? "Link" : "View"
        } Trade Plan`}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {/* symbol, direction, opened on, closed on, quantity. mini table this for consistency */}
          <MiniTable
            // className="px-2"
            title={"Trade Info"}
            columns={columns}
            data={[tradeInfo]}
          />
          {!tradeInfo?.tradePlan ? (
            <div>
              <p className="mt-4">Trade Plans</p>
              <Select
                classNames={{ option: () => "whitespace-pre-wrap" }}
                placeholder="Select trade plan..."
                options={tradePlanOptions}
                onChange={setSelectedTradePlan}
                isSearchable
              />
            </div>
          ) : (
            <div className="mt-4">
              <TradePlanReadOnly
                tradePlan={tradeInfo?.tradePlan}
                items={tradePlanItems}
              />
            </div>
          )}
        </ModalBody>

        <ModalFooter>
          <button className="rounded-md border p-2 px-4 mr-4" onClick={onClose}>
            {" "}
            Close
          </button>
          <button
            className={`rounded-md ${
              !tradeInfo?.tradePlan ? "bg-purple-800" : "bg-red-500"
            } text-white p-2 px-4`}
            onClick={() => {
              if (
                onSubmit &&
                ((!tradeInfo?.tradePlan && selectedTradePlan) ||
                  !!tradeInfo.tradePlan)
              ) {
                onSubmit({
                  tradePlanId:
                    selectedTradePlan?.value || tradeInfo?.tradePlan?.id,
                  tradeId: tradeInfo.id,
                });
                setSelectedTradePlan(null);
              }
            }}
          >
            {!tradeInfo?.tradePlan ? "Link" : "Unlink"}
          </button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
