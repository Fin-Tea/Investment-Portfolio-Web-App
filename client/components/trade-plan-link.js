import React, { useState } from "react";
import Popup from "reactjs-popup";
import "reactjs-popup/dist/index.css";
import { formatDateShort } from "../date-utils";
import { calcRewardRiskRatio } from "../data-utils";
import PropTypes from "prop-types";

export default function TradePlanLink({
  tradeId,
  tradeSymbol,
  catalysts,
  tradePlanId,
  tradePlans,
  onToggleLink,
}) {
  const [planId, setPlanId] = useState(tradePlanId);

  const tradePlan = planId && tradePlans.find(({ id }) => id === planId);

  function handleToggleLink(linkInfo) {
    setPlanId(linkInfo.tradePlanId);
    onToggleLink(linkInfo);
  }

  return tradePlan ? (
    <TradePlanDetails
      tradeId={tradeId}
      catalysts={catalysts}
      tradePlan={tradePlan}
      onToggleLink={handleToggleLink}
    />
  ) : (
    <TradePlanSelection
      tradePlans={tradePlans}
      tradeId={tradeId}
      tradeSymbol={tradeSymbol}
      onToggleLink={handleToggleLink}
    />
  );
}

function TradePlanSelection({
  tradePlans,
  tradeId,
  tradeSymbol,
  onToggleLink,
}) {
  const [selectedTradePlanId, setSelectedTradePlanId] = useState(null);

  const eligibleTradePlans = tradePlans.filter(
    ({ securitySymbol, isTraded }) =>
      (securitySymbol === tradeSymbol ||
        tradeSymbol.startsWith(securitySymbol)) &&
      !isTraded
  );

  return (
    <Popup
      contentStyle={{ minWidth: 222, padding: 10 }}
      trigger={<button className="btn btn-secondary">Link</button>}
      position="top center"
      onClose={() => setSelectedTradePlanId(null)}
    >
      <div>
        <h4 style={{ textAlign: "center", fontSize: 20, paddingTop: 12 }}>
          Trading Plans
        </h4>
        <hr style={{ marginBottom: 0 }} />
        <div style={{ maxHeight: 222, overflow: "auto" }}>
          {eligibleTradePlans.map(
            ({
              id,
              securitySymbol,
              tradeDirectionType,
              validFrom,
              validUntil,
              entry,
            }) => (
              <div
                key={id}
                style={{
                  backgroundColor:
                    id === selectedTradePlanId ? "#30d97c" : "transparent",
                  borderBottom: "1px solid #c5c5c5",
                  marginTop: 12,
                }}
                className={id === selectedTradePlanId ? "active" : ""}
                onClick={() => {
                  console.log("selectedTradePlanId", id);
                  setSelectedTradePlanId(id);
                }}
              >
                <p
                  style={{ fontSize: 14, marginBottom: 5 }}
                >{`${securitySymbol} ${tradeDirectionType} ${formatDateShort(
                  validFrom
                )} - ${formatDateShort(validUntil)}`}</p>
                <p style={{ fontSize: 14 }}>{`Entry @ $${entry}`}</p>
              </div>
            )
          )}
        </div>
        <hr style={{ marginTop: 0 }} />
        <button
          style={{ width: "100%" }}
          disabled={!selectedTradePlanId}
          onClick={() =>
            onToggleLink({ tradeId, tradePlanId: selectedTradePlanId })
          }
        >
          Link Selected Plan
        </button>
      </div>
    </Popup>
  );
}

function TradePlanDetails({ tradeId, catalysts, tradePlan, onToggleLink }) {
  const {
    catalystId,
    securitySymbol,
    tradeDirectionType,
    entry,
    exit,
    stopLoss,
    tradeDescription,
  } = tradePlan;

  const catalyst = catalystId
    ? catalysts.find(({ value }) => value === catalystId).label
    : "N/A";

  return (
    <Popup
      trigger={<button className="btn btn-secondary">Details</button>}
      position="top center"
    >
      <div>
        <h4 style={{ textAlign: "center", fontSize: 20, paddingTop: 12 }}>
          Trade Plan
        </h4>
        <hr />
        <div style={{ maxHeight: 222, overflow: "auto" }}>
          <p
            style={{ fontSize: 14, marginBottom: 5 }}
          >{`${securitySymbol} ${tradeDirectionType}`}</p>
          <h4 style={{ fontSize: 18, marginBottom: 5 }}>Catalyst</h4>
          <p style={{ fontSize: 14, marginBottom: 10 }}>{catalyst}</p>
          <h4 style={{ fontSize: 18, marginBottom: 5 }}>Description</h4>
          <p style={{ fontSize: 14, marginBottom: 10 }}>{tradeDescription}</p>
          <h4 style={{ fontSize: 18, marginBottom: 5 }}>Reward / Risk</h4>
          <p style={{ fontSize: 14, marginBottom: 10 }}>
            {calcRewardRiskRatio({ entry, exit, stopLoss }) || ""}
          </p>
          <h4 style={{ fontSize: 18, marginBottom: 5 }}>Entry</h4>
          <p style={{ fontSize: 14, marginBottom: 10 }}>{entry}</p>
          <h4 style={{ fontSize: 18, marginBottom: 5 }}>Exit</h4>
          <p style={{ fontSize: 14, marginBottom: 10 }}>{exit}</p>
          <h4 style={{ fontSize: 18, marginBottom: 5 }}>Stop Loss</h4>
          <p style={{ fontSize: 14, marginBottom: 10 }}>{stopLoss}</p>
        </div>
        <hr />
        <button
          style={{ width: "100%" }}
          onClick={() => onToggleLink({ tradeId, tradePlanId: null })}
        >
          Unlink Plan
        </button>
      </div>
    </Popup>
  );
}

TradePlanLink.propTypes = {
  tradeId: PropTypes.number,
  tradeSymbol: PropTypes.string,
  catalysts: PropTypes.arrayOf(
    PropTypes.shape({ label: PropTypes.string, value: PropTypes.string })
  ),
  tradePlanId: PropTypes.number,
  tradePlans: PropTypes.arrayOf({}),
  onToggleLink: PropTypes.func,
};

TradePlanLink.defaultProps = {
  tradeId: -1,
  tradeSymbol: "",
  catalysts: [],
  tradePlanId: -1,
  tradePlans: [],
  onToggleLink: () => {},
};
