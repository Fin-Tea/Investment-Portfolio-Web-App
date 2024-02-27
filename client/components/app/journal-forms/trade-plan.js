import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import BaseForm from "./base-form";
import Autocomplete from "../autocomplete";
import Select from "react-select";
import { Switch } from "@chakra-ui/react";
import Tooltip from "../tooltip";
import Pill from "../pill";
import LinkTradesModal from "../link-trades-modal";
import MiniTable from "../mini-table";
import { formatJournalDate } from "../../../date-utils";

const QUALITY_TOLERANCE = 0.2;

const symbolFixtures = [{ label: "ES" }, { label: "NQ" }];

const tradeDirections = [
  { label: "Long", value: 0 },
  { label: "Short", value: 1 },
];

const setupFixtures = [
  { label: "Supply & Demand" },
  { label: "Gap Up/Down" },
  { label: "RSI Reversal" },
  { label: "Head & Shoulders" },
  { label: "Double Top/Bottom" },
  { label: "Bull/Bear Flag" },
  { label: "Bull/Bear Engulfing Candle" },
  { label: "Value Investing" },
];

const catalystFixtures = [{ label: "Catalyst 1" }, { label: "Catalyst 2" }];

const confirmationFixtures = [
  { label: "Order Absorption" },
  { label: "RSI Oversold" },
  { label: "RSI Overbought" },
  { label: "Break of Trend Line" },
  { label: "200 SMA crossover" },
];

const tradeResultsColumns = [
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

export default function TradePlan({ data, items, onSubmit, onDelete }) {
  const {
    securitySymbols,
    newsCatalysts,
    setups,
    confirmations,
    platformAccounts,
    tradeHistory,
  } = items;

  const validationSchema = Yup.object().shape({
    securitySymbol: Yup.object().required("Symbol is required"),
    tradeDirectionType: Yup.object().required("Trade direction is required"),
    setup: Yup.object().required("Trade setup/strategy is required"),
    hypothesis: Yup.string().required("Hypothesis direction is required"),
    invalidationPoint: Yup.string().required(
      "Invalidation Point direction is required"
    ),
    entry: Yup.number()
      .transform((value) => (Number.isNaN(value) ? null : value))
      .nullable()
      .required("Entry required"),
    stopLoss: Yup.number()
      .transform((value) => (Number.isNaN(value) ? null : value))
      .nullable()
      .required("Stop Loss required"),

    isAdvancedExit: Yup.boolean(),
    exit: Yup.number()
      .transform((value) => (Number.isNaN(value) ? null : value))
      .nullable()
      .when("isAdvancedExit", {
        is: false,
        then: Yup.number().required("Exit is required"),
      }),
    priceTarget1: Yup.number()
      .transform((value) => (Number.isNaN(value) ? null : value))
      .nullable()
      .when("isAdvancedExit", {
        is: true,
        then: Yup.number().required("Price Target 1 is required"),
      }),
    positionSizePercent1: Yup.number()
      .transform((value) => (Number.isNaN(value) ? null : value))
      .nullable()
      .when("isAdvancedExit", {
        is: true,
        then: Yup.number().required("Position Size % 1 is required"),
      }),
    priceTarget2: Yup.number()
      .transform((value) => (Number.isNaN(value) ? null : value))
      .nullable()
      .when("isAdvancedExit", {
        is: true,
        then: Yup.number("Price Target 2 is required"),
      }),
    positionSizePercent2: Yup.number()
      .transform((value) => (Number.isNaN(value) ? null : value))
      .nullable()
      .when("isAdvancedExit", {
        is: true,
        then: Yup.number().required("Position Size % 2 is required"),
      }),
    catalystLabel: Yup.object(),
    catalystDescription: Yup.string().when("catalystLabel", {
      is: (val) => !!val,
      then: Yup.string().required("Description is required"),
    }),
    catalystSentimentType: Yup.string().when("catalystLabel", {
      is: (val) => !!val,
      then: Yup.string().required("Sentiment is required"),
    }),
  });

  const formOptions = {
    defaultValues: {
      securitySymbol: securitySymbols.find(
        ({ label }) => label === data?.tradePlan.securitySymbol
      ),
      catalystLabel: newsCatalysts.find(
        ({ label }) => label === data?.tradePlan.newsCatalyst?.label
      ),
      catalystSentimentType: data?.tradePlan.newsCatalyst?.sentimentType,
      catalystURL: data?.tradePlan.newsCatalyst?.url,
      catalystDescription: data?.tradePlan.newsCatalyst?.newsText,
      setup: setups.find(({ label }) => label === data?.tradePlan.setup),
      tradeDirectionType: tradeDirections.find(
        ({ label }) => label === data?.tradePlan.tradeDirectionType
      ),
      hypothesis: data?.tradePlan.hypothesis,
      invalidationPoint: data?.tradePlan.invalidationPoint,
      entry: data?.tradePlan.entry,
      exit: data?.tradePlan.exit,
      stopLoss: data?.tradePlan.stopLoss,
      isAdvancedExit: data?.tradePlan.planType === "Advanced",
      priceTarget1: data?.tradePlan.priceTarget1,
      positionSizePercent1: data?.tradePlan.positionSizePercent1,
      priceTarget2: data?.tradePlan.priceTarget2,
      positionSizePercent2: data?.tradePlan.positionSizePercent2,
      priceTarget3: data?.tradePlan.priceTarget3,
      positionSizePercent3: data?.tradePlan.positionSizePercent3,
      confirmation1Id:
        data?.tradePlan.confirmations && data.tradePlan.confirmations[0]
          ? data.tradePlan.confirmations[0].id
          : 0,
      confirmation1:
        data?.tradePlan.confirmations && data.tradePlan.confirmations[0]
          ? confirmations.find(
              ({ label }) =>
                label === data.tradePlan.confirmations[0].confirmationText
            )
          : "",
      confirmation2Id:
        data?.tradePlan.confirmations && data.tradePlan.confirmations[1]
          ? data.tradePlan.confirmations[1].id
          : 0,
      confirmation2:
        data?.tradePlan.confirmations && data.tradePlan.confirmations[1]
          ? confirmations.find(
              ({ label }) =>
                label === data.tradePlan.confirmations[1].confirmationText
            )
          : "",
      confirmation3Id:
        data?.tradePlan.confirmations && data.tradePlan.confirmations[2]
          ? data.tradePlan.confirmations[2].id
          : 0,
      confirmation3:
        data?.tradePlan.confirmations && data.tradePlan.confirmations[2]
          ? confirmations.find(
              ({ label }) =>
                label === data.tradePlan.confirmations[2].confirmationText
            )
          : "",
    },
    resolver: yupResolver(validationSchema),
  };

  const {
    register,
    handleSubmit,
    formState,
    getValues,
    setValue,
    watch,
    reset,
  } = useForm(formOptions);
  const { errors } = formState;

  //const [symbol, setSymbol] = useState("");
  const securitySymbol = watch("securitySymbol");
  const catalystLabel = watch("catalystLabel");
  const catalystSentimentType = watch("catalystSentimentType");
  const catalystURL = watch("catalystURL");
  const catalystDescription = watch("catalystDescription");
  const setup = watch("setup");
  const [showNewsCatalyst, setShowNewsCatalyst] = useState(
    !!data?.tradePlan.newsCatalyst
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

  const [showConfirmations, setShowConfirmations] = useState(
    !!data?.tradePlan.confirmations
  );
  const confirmation1 = watch("confirmation1");
  const confirmation2 = watch("confirmation2");
  const confirmation3 = watch("confirmation3");

  const [showLinkTradesModal, setShowLinkTradesModal] = useState(false);

  console.log("errors", errors);

  function handlePillClick({ id }) {
    setValue("catalystSentimentType", id);
  }

  function handleTradeLinkUpdates(linkedTradeIds) {
    setValue("linkedTradeIds", linkedTradeIds);
    handleSubmit(onSubmit)();
  }

  let plannedAverageExit = 0;
  let plannedRewardRisk = null;
  let plannedRewardRiskColor = "text-black";
  let actualPnL = 0;
  let actualRewardRisk = null;
  let actualRewardRiskColor = "text-black";
  let averageOpenPrice = 0;
  let averageClosePrice = 0;
  let isExitEarly = false;
  let isExitEarlyColor = "text-black";
  let isStopLossLate = false;
  let isStopLossLateColor = "text-black";

  if (!isAdvancedExit) {
    if (entry && exit && stopLoss) {
      plannedRewardRisk = Math.abs(exit - entry) / Math.abs(entry - stopLoss);
    }
  } else {
    if (priceTarget1 && percentPosSize1 && priceTarget2 && percentPosSize2) {
      plannedAverageExit =
        (priceTarget1 * percentPosSize1) / 100 +
        (priceTarget2 * percentPosSize2) / 100;

      if (priceTarget3 && percentPosSize3) {
        plannedAverageExit += (priceTarget3 * percentPosSize3) / 100;
      }

      plannedRewardRisk =
        Math.abs(plannedAverageExit - entry) / Math.abs(entry - stopLoss);
    }
  }

  if (data?.tradePlan.tradeResults) {
    actualPnL = data.tradePlan.tradeResults.reduce((acc, result) => {
      return acc + result.pnl;
    }, 0);
    if (entry && stopLoss) {
      averageClosePrice =
        data.tradePlan.tradeResults.reduce((acc, result) => {
          return acc + result.closePrice;
        }, 0) / data.tradePlan.tradeResults.length;
      averageOpenPrice =
        data.tradePlan.tradeResults.reduce((acc, result) => {
          return acc + result.openPrice;
        }, 0) / data.tradePlan.tradeResults.length;
      if (actualPnL >= 0) {
        actualRewardRisk = actualPnL / Math.abs(entry - stopLoss);
        actualRewardRiskColor = "text-orange-500";
        if (actualRewardRisk >= 2) {
          actualRewardRiskColor = "text-green-600";
        }

        isExitEarly =
          Math.abs(averageClosePrice - averageOpenPrice) <
          (1 - QUALITY_TOLERANCE) *
            Math.abs((plannedAverageExit || exit) - entry);
        isExitEarlyColor = "text-green-600";
        if (isExitEarly) {
          isExitEarlyColor = "text-orange-500";
        }
      } else {
        isStopLossLate =
          tradeDirectionType.label === "Long"
            ? averageClosePrice < (1 - QUALITY_TOLERANCE) * stopLoss
            : averageClosePrice > (1 - QUALITY_TOLERANCE) * stopLoss;
        isStopLossLateColor = "text-green-600";
        if (isStopLossLate) {
          isStopLossLateColor = "text-orange-500";
        }
      }
    }
  }

  if (plannedRewardRisk) {
    plannedRewardRisk = (Math.round(plannedRewardRisk * 100) / 100).toFixed(2);
    plannedRewardRiskColor = "text-orange-500";

    if (plannedRewardRisk >= 2) {
      plannedRewardRiskColor = "text-green-600";
    }
  }

  if (actualRewardRisk) {
    actualRewardRisk = (Math.round(actualRewardRisk * 100) / 100).toFixed(2);
    actualRewardRiskColor = "text-orange-500";

    if (actualRewardRisk >= 2) {
      actualRewardRiskColor = "text-green-600";
    }
  }

  const hasConfirmation = confirmation1 || confirmation2 || confirmation3;
  const hasConfirmationColor = hasConfirmation
    ? "text-green-600"
    : "text-orange-500";
  const hasNewsCatalyst = catalystLabel || catalystURL || catalystDescription;

  useEffect(() => {
    reset(formOptions.defaultValues);
  }, [data, items]);

  let tradeResults = (data?.tradePlan?.tradeResults || []).map((trade) => {
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

  console.log("trade plan tradeResults", tradeResults);

  const tradePlanInfo = data
    ? { ...data.tradePlan, createdAt: formatJournalDate(data.createdAt) }
    : null;

  return (
    <div>
      <BaseForm
        header="Trade Plan"
        date={data?.updatedAt}
        edit={!!data}
        onSave={handleSubmit(onSubmit)}
        onDelete={onDelete}
      >
        <div>
          <label className="text-sm ml">Symbol*</label>
          <Autocomplete
            value={securitySymbol}
            items={securitySymbols}
            onSelect={(val) => setValue("securitySymbol", val)}
            tooltip="The symbol of the financial instrument being invested in or traded (e.g. AAPL for Apple)"
          />
          <div className="text-red-600 text-xs">{errors.symbol?.message}</div>
        </div>

        <div className="mt-4 flex items-center">
          <button
            className="rounded-md bg-purple-800 text-white px-4"
            onClick={() => setShowNewsCatalyst(!showNewsCatalyst)}
          >
            {`${
              showNewsCatalyst ? "Hide" : hasNewsCatalyst ? "Show" : "Add"
            }  News Catalyst`}
          </button>
          <Tooltip text="A macro economic event such as the pandemic, inflation, or FOMC interest rate announcements that cause market prices to move" />
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
                >
                  Bullish
                </Pill>
                <Pill
                  className="mr-2 mb-2"
                  id={"Bearish"}
                  controlled
                  onClick={handlePillClick}
                  isActive={catalystSentimentType === "Bearish"}
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
            />
            <Tooltip text="Why you believe the trade will be profitable (e.g. Key Levels of Interest like Support & Resistance, Trend Line breaks, price is overbought/oversold, etc." />
          </div>
          <div className="text-red-600 text-xs">
            {errors.hypothesis?.message}
          </div>
        </div>

        <div className="mt-4">
          <label className="text-sm ml">Invalidation Point*</label>
          <div className="flex items-top">
            <textarea
              className="border w-full rounded-md p-2"
              {...register("invalidationPoint")}
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
                  />
                  <Tooltip text="The percent of your postion size you plan to exit with at Price Target 3" />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 flex items-center">
          <span className="font-bold">Planned Reward Risk Ratio:&nbsp;</span>

          <span className={`${plannedRewardRiskColor}`}>
            {plannedRewardRisk || "Not enough info"}
          </span>
          <Tooltip text="The expected reward (profit) divided by the planned risk amount based on stop loss. A Reward Risk ratio of 2+ is standard" />
        </div>

        <div className="mt-4 flex items-center">
          <button
            className="rounded-md bg-purple-800 text-white px-4"
            onClick={() => setShowConfirmations(!showConfirmations)}
          >
            {`${
              showConfirmations ? "Hide" : hasConfirmation ? "Show" : "Add"
            }  Confirmations`}
          </button>
          <Tooltip text="Confirmations are pieces of information that increase the probability of success of your trade plan (e.g. a momentum indicator such as RSI showing a financial instrument is currently overbought or oversold)" />
        </div>

        {showConfirmations && (
          <div className="mt-4">
            <div className="w-full">
              <label className="text-sm ml">Confirmation 1</label>
              <Autocomplete
                items={confirmations}
                value={confirmation1}
                onSelect={(val) => setValue("confirmation1", val)}
              />
            </div>

            <div className="w-full mt-2">
              <label className="text-sm ml">Confirmation 2</label>
              <Autocomplete
                items={confirmations}
                value={confirmation2}
                onSelect={(val) => setValue("confirmation2", val)}
              />
            </div>

            <div className="w-full mt-2">
              <label className="text-sm ml">Confirmation 3</label>
              <Autocomplete
                items={confirmations}
                value={confirmation3}
                onSelect={(val) => setValue("confirmation3", val)}
              />
            </div>
          </div>
        )}

        <div className="mt-4 flex items-center">
          <button
            disabled={!data}
            className={`rounded-md ${
              !data ? "bg-gray-400" : "bg-purple-800"
            } text-white px-4`}
            onClick={() => setShowLinkTradesModal(true)}
          >
            Link/Unlink Trades
          </button>
          <Tooltip text="In edit mode, you can link your trade plan to the actual trade that happened so our tools can help you improve your trading & investing decisions" />
        </div>
        {tradeResults.length ? (
          <div className="mt-4">
            <MiniTable
              title="Trade Results"
              columns={tradeResultsColumns}
              data={tradeResults}
            />
          </div>
        ) : null}

        {tradeResults.length ? (
          <div className="mt-4">
            <p>Trade Analysis</p>
            {/* TODO: Add grades and points after MVP launch (not in scope for MVP) */}
            {/* <p>Overall Grade (A|B|C|D|F) (Reward trying & failing & growing over not trying or beginner's luck)</p> */}
            {/* <p>Points Earned (leaderboard)(Reward trying & failing & growing over not trying or beginner's luck)</p> */}
            <p className="text-sm">{`Profitable? ${
              actualPnL >= 0 ? "Yes" : "No"
            }`}</p>
            <p className="text-sm">
              Actual Reward Risk Ratio:
              <span className={`${actualRewardRiskColor}`}>{` ${
                actualRewardRisk || "Not enough info"
              }`}</span>
            </p>
            <p className="text-sm">
              Had Confirmation?{" "}
              <span className={`${hasConfirmationColor}`}>{` ${
                hasConfirmation ? "Yes" : "No"
              }`}</span>
            </p>
            <p className="text-sm">
              Exited Early?{" "}
              <span className={`${isExitEarlyColor}`}>{` ${
                actualPnL >= 0 ? (isExitEarly ? "Yes" : "No") : "N/A"
              }`}</span>
            </p>
            <p className="text-sm">
              Stopped Out Late?{" "}
              <span className={`${isStopLossLateColor}`}>{` ${
                actualPnL < 0 ? (isStopLossLate ? "Yes" : "No") : "N/A"
              }`}</span>
            </p>
          </div>
        ) : null}
      </BaseForm>
      {tradePlanInfo && (
        <LinkTradesModal
          isOpen={showLinkTradesModal}
          onClose={() => setShowLinkTradesModal(false)}
          tradePlanInfo={tradePlanInfo}
          trades={tradeHistory}
          tradePlanItems={items}
          onSubmit={handleTradeLinkUpdates}
        />
      )}
    </div>
  );
}
