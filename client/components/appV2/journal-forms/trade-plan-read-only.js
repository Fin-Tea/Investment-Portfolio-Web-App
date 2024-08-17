import React, { useState } from "react";
import { useForm } from "react-hook-form";
import BaseForm from "./base-form";
import Autocomplete from "../autocomplete";
import Select from "react-select";
import { Switch } from "@chakra-ui/react";
import Tooltip from "../tooltip";
import Pill from "../pill";

const tradeDirections = [
  { label: "Long", value: 0 },
  { label: "Short", value: 1 },
];


export default function TradePlanReadOnly({ tradePlan, items }) {
    const { securitySymbols, newsCatalysts, setups, confirmations } = items;

  const formOptions = {
    defaultValues: {
      securitySymbol: securitySymbols.find(
        ({ label }) => label === tradePlan.securitySymbol
      ),
      catalystLabel: newsCatalysts.find(
        ({ label }) => label === tradePlan.newsCatalyst?.label
      ),
      catalystSentimentType: tradePlan.newsCatalyst?.sentimentType,
      catalystURL: tradePlan.newsCatalyst?.url,
      catalystDescription: tradePlan.newsCatalyst?.newsText,
      setup: setups.find(({ label }) => label === tradePlan.setup),
      tradeDirectionType: tradeDirections.find(
        ({ label }) => label === tradePlan.tradeDirectionType
      ),
      hypothesis: tradePlan.hypothesis,
      invalidationPoint: tradePlan.invalidationPoint,
      entry: tradePlan.entry,
      exit: tradePlan.exit,
      stopLoss: tradePlan.stopLoss,
      isAdvancedExit: tradePlan.planType === "Advanced",
      priceTarget1: tradePlan.priceTarget1,
      positionSizePercent1: tradePlan.positionSizePercent1,
      priceTarget2: tradePlan.priceTarget2,
      positionSizePercent2: tradePlan.positionSizePercent2,
      priceTarget3: tradePlan.priceTarget3,
      positionSizePercent3: tradePlan.positionSizePercent3,
      confirmation1Id:
        tradePlan.confirmations && tradePlan.confirmations[0]
          ? tradePlan.confirmations[0].id
          : 0,
      confirmation1:
        tradePlan.confirmations && tradePlan.confirmations[0]
          ? confirmations.find(
              ({ label }) =>
                label === tradePlan.confirmations[0].confirmationText
            )
          : "",
      confirmation2Id:
        tradePlan.confirmations && tradePlan.confirmations[1]
          ? tradePlan.confirmations[1].id
          : 0,
      confirmation2:
        tradePlan.confirmations && tradePlan.confirmations[1]
          ? confirmations.find(
              ({ label }) =>
                label === tradePlan.confirmations[1].confirmationText
            )
          : "",
      confirmation3Id:
        tradePlan.confirmations && tradePlan.confirmations[2]
          ? tradePlan.confirmations[2].id
          : 0,
      confirmation3:
        tradePlan.confirmations && tradePlan.confirmations[2]
          ? confirmations.find(
              ({ label }) =>
                label === tradePlan.confirmations[2].confirmationText
            )
          : "",
    },
  };

  const { register, handleSubmit, formState, getValues, setValue, watch, reset } =
    useForm(formOptions);
  const { errors } = formState;

  //const [symbol, setSymbol] = useState("");
  const securitySymbol = watch("securitySymbol");
  const catalystLabel = watch("catalystLabel");
  const catalystSentimentType = watch("catalystSentimentType");
  const catalystURL = watch("catalystURL");
  const catalystDescription = watch("catalystDescription");
  const setup = watch("setup");
  const [showNewsCatalyst, setShowNewsCatalyst] = useState(
    !!tradePlan.newsCatalyst
  );
  //   const [sentimentTypeId, setSentimentTypeId] = useState("Bullish");
  const tradeDirectionType = watch("tradeDirectionType");
  const entry = watch("entry");
  const exit = watch("exit");
  const priceTarget1 = watch("priceTarget1");
  const percentPosSize1 = watch("positionSizePercent1");
  const priceTarget2 = watch("priceTarget2");
  const percentPosSize2 = watch("positionSizePercent2");
  const priceTarget3 = watch("priceTarget3");
  const percentPosSize3 = watch("positionSizePercent3");

  const stopLoss = watch("stopLoss");
  const isAdvancedExit = watch("isAdvancedExit");
  //   const [isAdvancedExit, setIsAdvancedExit] = useState(false);
  const [showConfirmations, setShowConfirmations] = useState(
    !!tradePlan.confirmations
  );
  const confirmation1 = watch("confirmation1");
  const confirmation2 = watch("confirmation2");
  const confirmation3 = watch("confirmation3");

  console.log("errors", errors);

  function handlePillClick({ id }) {
    setValue("catalystSentimentType", id);
  }

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
  const hasNewsCatalyst = catalystLabel || catalystURL || catalystDescription;


  return (
    <BaseForm header="Trade Plan" disabled={!!tradePlan}>
      <div>
        <label className="text-sm ml">Symbol*</label>
        <Autocomplete
          value={securitySymbol}
          items={securitySymbols}
          onSelect={(val) => setValue("securitySymbol", val)}
          tooltip="The symbol of the financial instrument being invested in or traded (e.g. AAPL for Apple)"
          disabled
        />
        <div className="text-red-600 text-xs">{errors.symbol?.message}</div>
      </div>

      {showNewsCatalyst && (
        <div className="mt-4">
          <h4 className="text-sm font-bold">News Catalyst</h4>
          <label className="text-sm ml">Label*</label>
          <Autocomplete
            items={newsCatalysts}
            onSelect={(val) => setValue("catalystLabel", val)}
            tooltip="Label your news catalysts so it's easy to know what news drives your profits (e.g. 'Fed Interest Rates' or 'Consumer Price Index (CPI) Report')"
            value={catalystLabel}
            disabled
          />
          <div className="mt-2">
            <label className="text-sm ml">Sentiment*</label>
            <div className="flex flex-wrap">
              <Pill
                className="mr-2 mb-2"
                id={"Bullish"}
                controlled
                onClick={handlePillClick}
                isActive={catalystSentimentType === "Bullish"}
                disabled
              >
                Bullish
              </Pill>
              <Pill
                className="mr-2 mb-2"
                id={"Bearish"}
                controlled
                onClick={handlePillClick}
                isActive={catalystSentimentType === "Bearish"}
                disabled
              >
                Bearish
              </Pill>
            </div>
          </div>

          <div className="mt-2">
            <label className="text-sm ml">URL</label>
            <div className="flex items-center">
              <input
                type="url"
                {...register("catalystURL")}
                className="border w-full rounded-md p-2"
                disabled
              />
              <Tooltip text="The link to the web page where you found the news (optional)" />
            </div>
          </div>

          <div className="mt-4">
            <label className="text-sm ml">Description*</label>
            <div className="flex items-top">
              <textarea
                className="border w-full rounded-md p-2"
                {...register("catalystDescription")}
                disabled
              />
            </div>
            <div className="text-red-600 text-xs">
              {errors.catalystDescription?.message}
            </div>
          </div>
          {/* TODO: fix styling (need to override bootstrap) */}
          <hr
            style={{ borderTop: "1px solid rgb(209 213 219)" }}
            className="w-full mx-auto bg-transparent"
          />
        </div>
      )}

      <div className="mt-4">
        <label className="text-sm ml">Trade Setup/Strategy*</label>
        <Autocomplete
          value={setup}
          items={setups}
          onSelect={(val) => setValue("setup", val)}
          tooltip="The repeatable trading/investing pattern/setup you are putting into action"
          disabled
        />
        <div className="text-red-600 text-xs">{errors.setup?.message}</div>
      </div>

      <div className="mt-4">
        <div className="w-full">
          <label className="text-sm ml">Trade Direction*</label>
          <div className="flex items-center">
            <Select
              className="w-full"
              options={tradeDirections}
              value={tradeDirectionType}
              onChange={(val) => setValue("tradeDirectionType", val)}
              isDisabled
            />
            <Tooltip text="Long if you believe price will go up (bullish) or Short if you believe price will go down (bearish)" />
          </div>
          <div className="text-red-600 text-xs">
            {errors.tradeDirection?.message}
          </div>
        </div>
      </div>

      <div className="mt-4">
        <label className="text-sm ml">Hypothesis*</label>
        <div className="flex items-top">
          <textarea
            className="border w-full rounded-md p-2"
            {...register("hypothesis")}
            disabled
          />
          <Tooltip text="Why you believe the trade will be profitable (e.g. Key Levels of Interest like Support & Resistance, Trend Line breaks, price is overbought/oversold, etc." />
        </div>
        <div className="text-red-600 text-xs">{errors.hypothesis?.message}</div>
      </div>

      <div className="mt-4">
        <label className="text-sm ml">Invalidation Point*</label>
        <div className="flex items-top">
          <textarea
            className="border w-full rounded-md p-2"
            {...register("invalidationPoint")}
            disabled
          />
          <Tooltip text="Where your hypothesis would be proven wrong (important for Risk Management)" />
        </div>
        <div className="text-red-600 text-xs">
          {errors.invalidationPoint?.message}
        </div>
      </div>

      <div className="mt-4 ">
        <label className="text-sm ml">Entry*</label>
        <div className="flex items-center">
          <input
            type="number"
            min={0}
            {...register("entry")}
            onWheel={(e) => e.target.blur()}
            className="border w-full rounded-md p-2"
            disabled
          />
          <Tooltip text="The price where you want to enter the trade or investment" />
        </div>
        <div className="text-red-600 text-xs">{errors.entry?.message}</div>
      </div>

      <div className="mt-4">
        <label className="text-sm ml">Stop Loss*</label>
        <div className="flex items-center">
          <input
            type="number"
            min={0}
            {...register("stopLoss")}
            onWheel={(e) => e.target.blur()}
            className="border w-full rounded-md p-2"
            disabled
          />
          <Tooltip text="The price where you want to close the trade or investment at a minimal loss to protect your capital (important for Risk Management)" />
        </div>
        <div className="text-red-600 text-xs">{errors.stopLoss?.message}</div>
      </div>

      <div className="mt-4">
        <div className="flex">
          <span className="text-base">Simple</span>
          <Switch
            sx={{
              "span.chakra-switch__track:not([data-checked])": {
                backgroundColor: "green.300",
              },
            }}
            colorScheme="purple"
            className="mx-2"
            // onChange={(e) => setIsAdvancedExit(e.target.checked)}
            {...register("isAdvancedExit")}
            disabled
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
                {...register("exit")}
                onWheel={(e) => e.target.blur()}
                className="border w-full rounded-md p-2"
                disabled
              />
              <Tooltip text="The price where you want to exit the trade or investment at a profit" />
            </div>
            <div className="text-red-600 text-xs">{errors.exit?.message}</div>
          </div>
        ) : (
          <div>
            <div>
              <label className="text-sm ml">Price Target 1*</label>
              <div className="flex items-center">
                <input
                  type="number"
                  min={0}
                  {...register("priceTarget1")}
                  onWheel={(e) => e.target.blur()}
                  className="border w-full rounded-md p-2"
                  disabled
                />
                <Tooltip text="The first price where you want to partially exit the trade or investment at a profit" />
              </div>
              <div className="text-red-600 text-xs">
                {errors.priceTarget1?.message}
              </div>
            </div>
            <div className="mt-2">
              <label className="text-sm ml">% of Position Size*</label>
              <div className="flex items-center">
                <input
                  type="number"
                  min={0}
                  max={100}
                  {...register("positionSizePercent1")}
                  onWheel={(e) => e.target.blur()}
                  className="border w-full rounded-md p-2"
                  disabled
                />
                <Tooltip text="The percent of your postion size you plan to exit with at Price Target 1" />
              </div>
              <div className="text-red-600 text-xs">
                {errors.positionSizePercent1?.message}
              </div>
            </div>

            <div className="mt-4">
              <label className="text-sm ml">Price Target 2*</label>
              <div className="flex items-center">
                <input
                  type="number"
                  min={0}
                  {...register("priceTarget2")}
                  onWheel={(e) => e.target.blur()}
                  className="border w-full rounded-md p-2"
                  disabled
                />
                <Tooltip text="The second price where you want to partially exit the trade or investment at a profit" />
              </div>
              <div className="text-red-600 text-xs">
                {errors.priceTarget2?.message}
              </div>
            </div>

            <div className="mt-2">
              <label className="text-sm ml">% of Position Size*</label>
              <div className="flex items-center">
                <input
                  type="number"
                  min={0}
                  max={100}
                  {...register("positionSizePercent2")}
                  onWheel={(e) => e.target.blur()}
                  className="border w-full rounded-md p-2"
                  disabled
                />
                <Tooltip text="The percent of your postion size you plan to exit with at Price Target 2" />
              </div>
              <div className="text-red-600 text-xs">
                {errors.positionSizePercent2?.message}
              </div>
            </div>

            <div className="mt-4">
              <label className="text-sm ml">Price Target 3</label>
              <div className="flex items-center">
                <input
                  type="number"
                  min={0}
                  {...register("priceTarget3")}
                  onWheel={(e) => e.target.blur()}
                  className="border w-full rounded-md p-2"
                  disabled
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
                  {...register("positionSizePercent3")}
                  onWheel={(e) => e.target.blur()}
                  className="border w-full rounded-md p-2"
                  disabled
                />
                <Tooltip text="The percent of your postion size you plan to exit with at Price Target 3" />
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

      {showConfirmations && (
        <div className="mt-4">
          <div className="w-full">
            <label className="text-sm ml">Confirmation 1</label>
            <Autocomplete
              items={confirmations}
              value={confirmation1}
              onSelect={(val) => setValue("confirmation1", val)}
              disabled
            />
          </div>

          <div className="w-full mt-2">
            <label className="text-sm ml">Confirmation 2</label>
            <Autocomplete
              items={confirmations}
              value={confirmation2}
              onSelect={(val) => setValue("confirmation2", val)}
              disabled
            />
          </div>

          <div className="w-full mt-2">
            <label className="text-sm ml">Confirmation 3</label>
            <Autocomplete
              items={confirmations}
              value={confirmation3}
              onSelect={(val) => setValue("confirmation3", val)}
              disabled
            />
          </div>
        </div>
      )}
    </BaseForm>
  );
}
