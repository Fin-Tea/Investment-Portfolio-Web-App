import InteractiveTable from "./interactive-table";
import DatePicker from "react-datepicker";
import Creatable from "react-select/creatable";
import { calcRewardRiskRatio } from "../data-utils";
import PropTypes from "prop-types";

import "react-datepicker/dist/react-datepicker.css"; // TODO: Import this only once at app level

const rewardRiskFieldName = (id) => `rows.${id}.rewardRiskRatio`;
const RECALC_REWARD_RISK_RATIO = "recalcRewardRiskRatio";

export default function TradePlanner({
  plans,
  catalysts,
  onCreateCatalyst,
  tradeDirections,
  onSave,
  saveError,
}) {
  const columns = [
    {
      Header: "ID",
      accessor: "id",
    },
    {
      Header: "Catalyst",
      accessor: "catalystId",
      Cell: ({ cell, register, setValue }) => {
        const { id, catalystId } = cell.row.values;
        const defaultValue = catalysts.find(
          ({ value }) => value === catalystId
        );
        const name = `rows.${id}.catalystId`;

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
      Header: "Valid From",
      accessor: "validFrom",
      Cell: ({ cell, register, setValue, getValues }) => {
        const { id, validFrom } = cell.row.values;
        const name = `rows.${id}.validFrom`;

        let value = getValues(name);
        value = value ? new Date(value) : null;

        if (!value && validFrom) {
          value = new Date(validFrom);
        }

        return (
          <DatePicker
            {...register(name)}
            selected={value}
            onChange={(date) => {
              setValue(name, date, { shouldDirty: true });
            }}
          />
        );
      },
    },
    {
      Header: "Valid Until",
      accessor: "validUntil",
      Cell: ({ cell, register, setValue, getValues }) => {
        const { id, validUntil } = cell.row.values;
        const name = `rows.${id}.validUntil`;

        let value = getValues(name);
        value = value ? new Date(value) : null;

        if (!value && validUntil) {
          value = new Date(validUntil);
        }

        return (
          <DatePicker
            {...register(name)}
            selected={value}
            onChange={(date) => {
              setValue(name, date, { shouldDirty: true });
            }}
          />
        );
      },
    },
    {
      Header: "Security Symbol",
      accessor: "securitySymbol",
      Cell: ({ cell, register }) => {
        const { securitySymbol, id } = cell.row.values;
        const name = `rows.${id}.securitySymbol`;

        return (
          <input
            style={{ width: "100%" }}
            defaultValue={securitySymbol}
            title={securitySymbol}
            {...register(name)}
          />
        );
      },
    },
    {
      Header: "Trade Direction",
      accessor: "tradeDirectionType",
      Cell: ({ cell, register, setValue }) => {
        const { id, tradeDirectionType } = cell.row.values;
        const defaultValue = tradeDirections.find(
          ({ label }) => label === tradeDirectionType
        );
        const name = `rows.${id}.tradeDirectionType`;

        return (
          <Creatable
            options={tradeDirections}
            defaultValue={defaultValue}
            {...register(name)}
            onChange={({ label }) => {
              setValue(name, label, { shouldDirty: true });
            }}
          />
        );
      },
    },
    {
      Header: "Entry",
      accessor: "entry",
      Cell: ({ cell, register, setValue, setRowData }) => {
        const { entry, id, exit, stopLoss } = cell.row.values;
        const name = `rows.${id}.entry`;
        return (
          <input
            type="number"
            style={{ width: "100%" }}
            defaultValue={entry}
            title={entry}
            {...register(name)}
            onChange={({ target: { value } }) => {
              setValue(name, value, { shouldDirty: true });
              const rewardRiskRatio = calcRewardRiskRatio({
                entry: value,
                exit,
                stopLoss,
              });
              if (rewardRiskRatio) {
                setRowData(id, RECALC_REWARD_RISK_RATIO, rewardRiskRatio);
              }
            }}
          />
        );
      },
    },
    {
      Header: "Exit",
      accessor: "exit",
      Cell: ({ cell, register, setValue, setRowData }) => {
        const { exit, id, entry, stopLoss } = cell.row.values;
        const name = `rows.${id}.exit`;
        return (
          <input
            type="number"
            style={{ width: "100%" }}
            defaultValue={exit}
            title={exit}
            {...register(name)}
            onChange={({ target: { value } }) => {
              setValue(name, value, { shouldDirty: true });
              const rewardRiskRatio = calcRewardRiskRatio({
                entry,
                exit: value,
                stopLoss,
              });
              if (rewardRiskRatio) {
                setRowData(id, RECALC_REWARD_RISK_RATIO, rewardRiskRatio);
              }
            }}
          />
        );
      },
    },
    {
      Header: "Stop Loss",
      accessor: "stopLoss",
      Cell: ({ cell, register, setValue, setRowData }) => {
        const { stopLoss, id, entry, exit } = cell.row.values;
        const name = `rows.${id}.stopLoss`;
        return (
          <input
            type="number"
            style={{ width: "100%" }}
            defaultValue={stopLoss}
            title={stopLoss}
            {...register(name)}
            onChange={({ target: { value } }) => {
              setValue(name, value, { shouldDirty: true });
              const rewardRiskRatio = calcRewardRiskRatio({
                entry,
                exit,
                stopLoss: value,
              });
              if (rewardRiskRatio) {
                setRowData(id, RECALC_REWARD_RISK_RATIO, rewardRiskRatio);
              }
            }}
          />
        );
      },
    },
    {
      Header: "Reward / Risk",
      accessor: "recalcRewardRiskRatio",
      Cell: ({ cell, register }) => {
        const { id, entry, exit, stopLoss, recalcRewardRiskRatio } =
          cell.row.values;
        const name = rewardRiskFieldName(id);

        let rewardRiskRatio = recalcRewardRiskRatio;

        if (!rewardRiskRatio) {
          rewardRiskRatio =
            calcRewardRiskRatio({
              entry,
              exit,
              stopLoss,
            }) || "-";
        }

        return (
          <span style={{ width: "100%" }} {...register(name)}>
            {rewardRiskRatio}
          </span>
        );
      },
    },
    {
      Header: "Trade Description",
      accessor: "tradeDescription",
      Cell: ({ cell, register }) => {
        const { tradeDescription, id } = cell.row.values;
        const name = `rows.${id}.tradeDescription`;
        return (
          <textarea
            style={{ width: "100%" }}
            defaultValue={tradeDescription}
            title={tradeDescription}
            {...register(name)}
          />
        );
      },
    },
    {
      Header: "Plan Traded?",
      accessor: "isTraded",
      Cell: ({ cell }) => {
        const { isTraded } = cell.row.values;
        return <span>{isTraded ? "y" : "n"}</span>;
      },
    },
  ];

  return (
    <InteractiveTable
      title="Trade Planner"
      columns={columns}
      data={plans}
      onSave={onSave}
      saveError={saveError}
      allowRowPreprend={true}
    />
  );
}

TradePlanner.propTypes = {
  plans: PropTypes.arrayOf({}),
  catalysts: PropTypes.arrayOf({}),
  onCreateCatalyst: PropTypes.func,
  tradeDirections: PropTypes.arrayOf({}),
  onSave: PropTypes.func,
  saveError: PropTypes.string,
};

TradePlanner.defaultProps = {
  plans: [],
  catalysts: [],
  onCreateCatalyst: () => {},
  tradeDirections: [],
  onSave: () => {},
  saveError: "",
};
