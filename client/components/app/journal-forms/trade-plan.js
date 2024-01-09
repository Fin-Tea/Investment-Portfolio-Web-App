import React, { useState } from "react";
import BaseForm from "./base-form";
import Autocomplete from "../autocomplete";
import Select from "react-select";
import { Switch } from "@chakra-ui/react";
import Tooltip from "../tooltip";

const tradeDirections = [
  { label: "Long", value: 0 },
  { label: "Short", value: 1 },
];

const confirmationFixtures = [{ label: "Order Absorption" }, { label: "RSI Oversold" }, { label: "RSI Overbought" }, { label: "Break of Trend Line" }, { label: "200 SMA crossover" }];

export default function TradePlan({ id, onSubmit }) {
  const [symbol, setSymbol] = useState("");
  const [catalyst, setCatalyst] = useState("");
  const [tradeDirection, setTradeDirection] = useState(null);
  const [entry, setEntry] = useState(null);
  const [exit, setExit] = useState(null);
  const [priceTarget1, setPriceTarget1] = useState(null);
  const [percentPosSize1, setPercentPosSize1] = useState(null);
  const [priceTarget2, setPriceTarget2] = useState(null);
  const [percentPosSize2, setPercentPosSize2] = useState(null);
  const [priceTarget3, setPriceTarget3] = useState(null);
  const [percentPosSize3, setPercentPosSize3] = useState(null);
  const [stopLoss, setStopLoss] = useState(null);
  const [isAdvancedExit, setIsAdvancedExit] = useState(false);
  const [showConfirmations, setShowConfirmations] = useState(false);
  const [confirmation1, setConfirmation1] = useState("");
  const [confirmation2, setConfirmation2] = useState("");
  const [confirmation3, setConfirmation3] = useState("");
  console.log("symbol", symbol);

  let rewardRisk = null;
  let rewardRiskColor = "text-black";

  if (!isAdvancedExit) {
    if (entry && exit && stopLoss) {
      rewardRisk = Math.abs(exit - entry) / Math.abs(entry - stopLoss);
    }
  } else {
    if (priceTarget1 && percentPosSize1 && priceTarget2 && percentPosSize2) {
      let averageExit =
        (Math.abs(priceTarget1 - entry) * percentPosSize1) / 100 +
        (Math.abs(priceTarget2 - entry) * percentPosSize2) / 100;

      if (priceTarget3 && percentPosSize3) {
        averageExit += (Math.abs(priceTarget3 - entry) * percentPosSize3) / 100;
      }

      console.log("averageExit", averageExit);

      rewardRisk = averageExit / Math.abs(entry - stopLoss);
    }
  }

  if (rewardRisk) {
    rewardRisk = (Math.round(rewardRisk * 100) / 100).toFixed(2);
    rewardRiskColor = "text-orange-500";

    if (rewardRisk >= 2) {
      rewardRiskColor = "text-green-600";
    }
  }

  const hasConfirmation = confirmation1 || confirmation2 || confirmation3;

  return (
    <BaseForm header="Trade Plan">
      <div>
        <label className="text-sm ml">Symbol*</label>
        <Autocomplete
          items={[{ label: "ES" }, { label: "NQ" }]}
          onSearch={(value) => setSymbol(value)}
          onSelect={({ label }) => setSymbol(label)}
          tooltip="The symbol of the financial instrument being invested in or traded (e.g. AAPL for Apple)"
        />
      </div>
      <div className="mt-4">
        <label className="text-sm ml">News Catalyst</label>
        <Autocomplete
          items={[{ label: "Catalyst 1" }, { label: "Catalyst 2" }]}
          onSearch={(value) => setCatalyst(value)}
          onSelect={({ label }) => setCatalyst(label)}
          tooltip="A macro economic event such as the pandemic, inflation, or FOMC interest rate announcements that cause market prices to move"
        />
      </div>

      <div className="mt-4">
        <div className="w-full">
          <label className="text-sm ml">Trade Direction*</label>
          <div className="flex items-center">
            <Select
              className="w-full"
              options={tradeDirections}
              onChange={(direction) => setTradeDirection(direction)}
            />
            <Tooltip text="Long if you believe price will go up (bullish) or Short if you believe price will go down (bearish)" />
          </div>
        </div>
      </div>

      <div className="mt-4">
        <label className="text-sm ml">Hypothesis*</label>
        <div className="flex items-top">
          <textarea className="border w-full rounded-md p-2" />
          <Tooltip text="Why you believe the trade will be profitable (e.g. Key Levels of Interest like Support & Resistance, Trend Line breaks, price is overbought/oversold, etc." />
        </div>
      </div>

      <div className="mt-4">
        <label className="text-sm ml">Invalidation Point*</label>
        <div className="flex items-top">
          <textarea className="border w-full rounded-md p-2" />
          <Tooltip text="Where your hypothesis would be proven wrong (important for Risk Management)" />
        </div>
      </div>

      <div className="mt-4 ">
        <label className="text-sm ml">Entry*</label>
        <div className="flex items-center">
          <input
            type="number"
            min={0}
            value={entry}
            onChange={(e) => setEntry(e.target.value)}
            onWheel={(e) => e.target.blur()}
            className="border w-full rounded-md p-2"
          />
          <Tooltip text="The price where you want to enter the trade or investment" />
        </div>
      </div>

      <div className="mt-4">
        <label className="text-sm ml">Stop Loss*</label>
        <div className="flex items-center">
          <input
            type="number"
            min={0}
            value={stopLoss}
            onChange={(e) => setStopLoss(e.target.value)}
            onWheel={(e) => e.target.blur()}
            className="border w-full rounded-md p-2"
          />
          <Tooltip text="The price where you want to close the trade or investment at a minimal loss to protect your capital (important for Risk Management)" />
        </div>
      </div>

      <div className="mt-4">
        <div className="flex">
          <span className="text-base">Simple</span>
          <Switch
            colorScheme="purple"
            className="mx-2"
            onChange={(e) => setIsAdvancedExit(e.target.checked)}
          />
          <span className="text-base">Advanced</span>
        </div>
        {!isAdvancedExit ? (
          <div>
            <label className="text-sm ml">Exit*</label>
            <div className="flex items-center">
              <input
                type="number"
                min={0}
                value={exit}
                onChange={(e) => setExit(e.target.value)}
                onWheel={(e) => e.target.blur()}
                className="border w-full rounded-md p-2"
              />
              <Tooltip text="The price where you want to exit the trade or investment at a profit" />
            </div>
          </div>
        ) : (
          <div>
            <div>
              <label className="text-sm ml">Price Target 1*</label>
              <div className="flex items-center">
                <input
                  type="number"
                  min={0}
                  value={priceTarget1}
                  onChange={(e) => setPriceTarget1(e.target.value)}
                  onWheel={(e) => e.target.blur()}
                  className="border w-full rounded-md p-2"
                />
                <Tooltip text="The first price where you want to partially exit the trade or investment at a profit" />
              </div>
            </div>
            <div className="mt-2">
              <label className="text-sm ml">% of Position Size*</label>
              <div className="flex items-center">
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={percentPosSize1}
                  onChange={(e) => setPercentPosSize1(e.target.value)}
                  onWheel={(e) => e.target.blur()}
                  className="border w-full rounded-md p-2"
                />
                <Tooltip text="The percent of your postion size you plan to exit with at Price Target 1" />
              </div>
            </div>

            <div className="mt-4">
              <label className="text-sm ml">Price Target 2*</label>
              <div className="flex items-center">
                <input
                  type="number"
                  min={0}
                  value={priceTarget2}
                  onChange={(e) => setPriceTarget2(e.target.value)}
                  onWheel={(e) => e.target.blur()}
                  className="border w-full rounded-md p-2"
                />
                <Tooltip text="The second price where you want to partially exit the trade or investment at a profit" />
              </div>
            </div>

            <div className="mt-2">
              <label className="text-sm ml">% of Position Size*</label>
              <div className="flex items-center">
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={percentPosSize2}
                  onChange={(e) => setPercentPosSize2(e.target.value)}
                  onWheel={(e) => e.target.blur()}
                  className="border w-full rounded-md p-2"
                />
                <Tooltip text="The percent of your postion size you plan to exit with at Price Target 2" />
              </div>
            </div>

            <div className="mt-4">
              <label className="text-sm ml">Price Target 3</label>
              <div className="flex items-center">
                <input
                  type="number"
                  min={0}
                  value={priceTarget3}
                  onChange={(e) => setPriceTarget3(e.target.value)}
                  onWheel={(e) => e.target.blur()}
                  className="border w-full rounded-md p-2"
                />
                <Tooltip text="The third price where you want to partially exit the trade or investment at a profit" />
              </div>
            </div>

            <div className="mt-2">
              <label className="text-sm ml">% of Position Size</label>
              <div className="flex items-center">
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={percentPosSize3}
                  onChange={(e) => setPercentPosSize3(e.target.value)}
                  onWheel={(e) => e.target.blur()}
                  className="border w-full rounded-md p-2"
                />
                <Tooltip text="The percent of your postion size you plan to exit with at Price Target 2" />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center">
        <span className="font-bold">Reward Risk Ratio:&nbsp;</span>

        <span className={`${rewardRiskColor}`}>
          {rewardRisk || "Not enough info"}
        </span>
        <Tooltip text="The expected reward (profit) divided by the planned risk amount based on stop loss. A Reward Risk ratio of 2+ is standard" />
      </div>

      <div className="mt-4 flex items-center">
        <button
          className="rounded-md bg-purple-800 text-white px-4"
          onClick={() => setShowConfirmations(!showConfirmations)}
        >
          {`${showConfirmations ? "Hide" : hasConfirmation ? "Show" : "Add"}  Confirmations`}
        </button>
        <Tooltip text="Confirmations are pieces of information that increase the probability of success of your trade plan (e.g. a momentum indicator such as RSI showing a financial instrument is currently overbought or oversold)" />
      </div>

      {showConfirmations && (
        <div className="mt-4">
          <div className="w-full">
            <label className="text-sm ml">Confirmation 1</label>
            <Autocomplete
              items={confirmationFixtures}
              value={confirmation1}
              onSearch={(value) => setConfirmation1(value)}
              onSelect={({ label }) => setConfirmation1(label)}
            />
          </div>

          <div className="w-full mt-2">
            <label className="text-sm ml">Confirmation 2</label>
            <Autocomplete
              items={confirmationFixtures}
              value={confirmation2}
              onSearch={(value) => setConfirmation2(value)}
              onSelect={({ label }) => setConfirmation2(label)}
            />
          </div>

          <div className="w-full mt-2">
            <label className="text-sm ml">Confirmation 3</label>
            <Autocomplete
              items={confirmationFixtures}
              value={confirmation3}
              onSearch={(value) => setConfirmation3(value)}
              onSelect={({ label }) => setConfirmation3(label)}
            />
          </div>
        </div>
      )}

      <div className="mt-4 flex items-center">
        <button disabled={!id} className="rounded-md bg-gray-400 text-white px-4">
          Link Trade
        </button>
        <Tooltip text="In edit mode, you can link your trade plan to the actual trade that happened so our tools can help you improve your trading & investing decisions" />
      </div>
    </BaseForm>
  );
}
